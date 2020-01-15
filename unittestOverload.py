import sys
import unittest
import traceback


class TextTestRunnerCustom(unittest.TextTestRunner):
    def __init__(self, stream=None, descriptions=True, verbosity=1,
                 failfast=False, buffer=False, resultclass=None, warnings=None, code="", *, tb_locals=False):
        super(TextTestRunnerCustom, self).__init__(
            stream, descriptions, verbosity,
            failfast, buffer, resultclass, warnings, tb_locals=tb_locals)
        self.code = code

    def _makeResult(self):
        return self.resultclass(self.stream, self.descriptions, self.verbosity, self.code)


class TestResultFormatted(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity, code=""):
        super(TestResultFormatted, self).__init__(
            stream, descriptions, verbosity)
        self.result = []
        self.code = code

    def addSuccess(self, test):
        self.result.append((test, "<SUCCESS>", self.formatString("")))

    def addFailure(self, test, err):
        self.failures.append((test, err))
        self.result.append((test, "<FAILURE>", self.formatString(err[1])))

    def addError(self, test, err):
        self.errors.append((test, err))
        if (str(err[1]) == ""):
            self.result.append(
                (test, "<ERROR>", self.formatString("Memory Error")))
            return False

        tracebackMsg = traceback.format_tb(err[2], -1)[0]
        tracebackMsgLine = int(tracebackMsg.split(
            "\", line ")[1].split(",")[0])
        line = self.code.split("\n")[tracebackMsgLine - 1]

        self.result.append(
            (test, "<ERROR>", self.formatString(str(err[1]) + '\n' + tracebackMsg + "\n" + line)))

    def formatString(self, err):
        msg = str(err)
        output = sys.stdout.getvalue()
        error = sys.stderr.getvalue()
        if output:
            if not output.endswith('\n'):
                output += '\n'
            msg += "\nLOG:\n" + output
        if error:
            if not error.endswith('\n'):
                error += '\n'
            msg += "\nERROR:\n" + error
        return msg

    def printErrors(self):
        for test, status, err in self.result:
            self.stream.writeln("\n")
            self.stream.writeln("%s %s: %s" %
                                (status, str(test).split(" ")[0], err))
