import sys
import unittest


class TestResultFormatted(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super(TestResultFormatted, self).__init__(
            stream, descriptions, verbosity)
        self.result = []

    def addSuccess(self, test):
        self.result.append((test, "<SUCCESS>", self.formatString("")))

    def addFailure(self, test, err):
        self.failures.append((test, err))
        self.result.append((test, "<FAILURE>", self.formatString(err[1])))

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
