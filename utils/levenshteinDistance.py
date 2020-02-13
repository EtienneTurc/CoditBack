def LevenshteinDistance(s1, s2):
    cost = 0
    m = len(s1) + 1
    n = len(s2) + 1
    d = [[0 for _ in range(n)] for _ in range(m)]

    for i in range(1, n):
        d[0][i] = i
    for i in range(1, m):
        d[i][0] = i

    for j in range(1, n):
        for i in range(1, m):
            if s1[i - 1] == s2[j-1]:
                cost = 0
            else:
                cost = 1
            d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + cost)

    return d[-1][-1]


def getClosest(funcs, name):
    if not len(funcs):
        return ""

    best = funcs[0]
    bv = LevenshteinDistance(funcs[0], name)
    for f in funcs[1:]:
        v = LevenshteinDistance(f, name)
        if v < bv:
            best = f
            bv = v
    return best, bv
