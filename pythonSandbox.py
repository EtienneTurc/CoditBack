from config.allowedModule import *

import resource
import bdb
import json
import sys
import traceback
import types

is_python3 = (sys.version_info[0] == 3)

if is_python3:
    import io as cStringIO
else:
    import cStringIO

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
    def __init__(self, finalizer_func):
        bdb.Bdb.__init__(self)
        self.ORIGINAL_STDOUT = sys.stdout
        self.ORIGINAL_STDERR = sys.stderr
        self.finalizer_func = finalizer_func
        self.executed_script = None

    def _runscript(self, script_str):
        self.executed_script = script_str

        self.user_stdout = cStringIO.StringIO()
        self.user_stderr = cStringIO.StringIO()

        sys.stdout = self.user_stdout
        sys.stderr = self.user_stderr

        try:
            # enforce resource limits RIGHT BEFORE running script_str

            # set ~200MB virtual memory limit AND a 5-second CPU time
            # limit  to protect against memory bombs such as:
            #   x = 2
            #   while True: x = x*x
            resource.setrlimit(resource.RLIMIT_AS,
                               (config["sandboxMemSize"], config["sandboxMemSize"]))
            resource.setrlimit(resource.RLIMIT_CPU,
                               (config["sandboxCPUTime"], config["sandboxCPUTime"]))

            # protect against unauthorized filesystem accesses ...
            resource.setrlimit(resource.RLIMIT_NOFILE,
                               (0, 0))  # cannot open files

            # (redundancy for paranoia ... might sometimes lead to weird behavior)
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

            # ... here we go!
            self.run(script_str)
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
def exec_str(script_str, finalizer):
    logger = SandboxExecutor(finalizer)

    try:
        logger._runscript(script_str)
    except bdb.BdbQuit:
        pass
    finally:
        return logger.finalize()


def json_finalizer(executor):
    return json.dumps(dict(code=executor.executed_script,
                           user_stdout=executor.user_stdout.getvalue(),
                           user_stderr=executor.user_stderr.getvalue()))


if __name__ == "__main__":
    script = open(sys.argv[1]).read()
    print(exec_str(script, json_finalizer))
