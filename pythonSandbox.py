import io as cStringIO
import types
import traceback
import sys
import json
import bdb
import resource
import unittest
import unittestOverload


DEBUG = True

with open('./config/config.json', 'r') as jsonFile:
    config = json.load(jsonFile)

# PREEMPTIVELY import all of these modules, so that when the user's
# script imports them, it won't try to do a file read (since they've
# already been imported and cached in memory). Remember that when
# the user's code runs, resource.setrlimit(resource.RLIMIT_NOFILE, (0, 0))
# will already be in effect, so no more files can be opened.
#
# NB: All modules in CUSTOM_MODULE_IMPORTS will be imported, warts and
# all, so they better work on Python 2 and 3!
for m in config["allowedModules"]:
    __import__(m)

# there's no point in banning builtins since malicious users can
# circumvent those anyways


class SandboxExecutor(bdb.Bdb):
    def __init__(self, finalizer_func, cpuTime, memorySize):
        bdb.Bdb.__init__(self)
        self.ORIGINAL_STDOUT = sys.stdout
        self.ORIGINAL_STDERR = sys.stderr
        self.finalizer_func = finalizer_func
        self.cpuTime = cpuTime
        self.memorySize = memorySize
        self.executed_script = None

    def _runscript(self, script_str, sutdent_str):
        self.executed_script = script_str

        self.user_stdout = cStringIO.StringIO()
        self.user_stderr = cStringIO.StringIO()

        sys.stdout = self.user_stdout
        sys.stderr = self.user_stderr

        try:
            unittestRunner = unittestOverload.TextTestRunnerCustom(
                resultclass=unittestOverload.TestResultFormatted, verbosity=1, buffer=True, code=student_str)
            # enforce resource limits RIGHT BEFORE running script_str

            # set ~200MB virtual memory limit AND a 5-second CPU time
            # limit  to protect against memory bombs such as:
            #   x = 2
            #   while True: x = x*x

            resource.setrlimit(resource.RLIMIT_CPU,
                               (self.cpuTime, self.cpuTime))
            resource.setrlimit(resource.RLIMIT_NPROC,
                               (1, 1))

            # protect against unauthorized filesystem accesses ...
            resource.setrlimit(resource.RLIMIT_NOFILE,
                               (0, 0))  # cannot open files

            # # (redundancy for paranoia ... might sometimes lead to weird behavior)
            resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))

            # sys.modules contains an in-memory cache of already-loaded
            # modules, so if you delete modules from here, they will
            # need to be re-loaded from the filesystem.
            #
            # Thus, as an extra precaution, remove these modules so that
            # they can't be re-imported without opening a new file,
            # which is disallowed by resource.RLIMIT_NOFILE
            #
            # Of course, this isn't a foolproof solution by any means,
            # and it might lead to unexpected failures later in execution.
            del sys.modules['os']
            del sys.modules['os.path']
            del sys.modules['sys']

            current_usage = resource.getrusage(
                resource.RUSAGE_SELF).ru_maxrss * 1024
            resource.setrlimit(resource.RLIMIT_AS,
                               (current_usage + self.memorySize, current_usage + self.memorySize))
            # ... here we go!
            globals_env = {'unittestRun': unittestRunner.run}
            self.run(student_str, globals_env)
            self.run(script_str, globals_env)
        # sys.exit ...
        except SystemExit:
            raise bdb.BdbQuit
        except:
            if DEBUG:
                traceback.print_exc()
            raise bdb.BdbQuit  # need to forceably STOP execution

    def finalize(self):
        sys.stdout = self.ORIGINAL_STDOUT
        sys.stderr = self.ORIGINAL_STDERR
        return self.finalizer_func(self)


# the MAIN meaty function
def exec_str(script_str, student_str, finalizer, cpuTime, memorySize):
    logger = SandboxExecutor(finalizer, cpuTime, memorySize)

    try:
        logger._runscript(script_str, student_str)
    except bdb.BdbQuit:
        pass
    finally:
        return logger.finalize()


def json_finalizer(executor):
    return json.dumps(dict(user_stdout=executor.user_stdout.getvalue(),
                           user_stderr=executor.user_stderr.getvalue()))


if __name__ == "__main__":
    test_script = open(sys.argv[1]).read()
    student_str = open(sys.argv[2]).read()
    cpuTime = int(sys.argv[3])
    memorySize = int(sys.argv[4])

    print(exec_str(test_script, student_str, json_finalizer,
                   cpuTime, memorySize))
