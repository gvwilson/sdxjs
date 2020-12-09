// Column names for summarization functions.
DataFrame.Count.colName = 'count'
DataFrame.Maximum.colName = 'maximum'
DataFrame.Mean.colName = 'mean'
DataFrame.Median.colName = 'median'
DataFrame.Minimum.colName = 'minimum'
DataFrame.StdDev.colName = 'stddev'
DataFrame.Sum.colName = 'sum'
DataFrame.Variance.colName = 'variance'

// Representing missing values.
DataFrame.MISSING = null

// Regular expression that table names have to match when joining.
DataFrame.TABLE_NAME = /^[A-Za-z][A-Za-z0-9_]*$/

// Regular expression that column names must match
DataFrame.COLUMN_NAME = /^[A-Za-z][A-Za-z0-9_]*$/

// Special column name used for grouping column.
DataFrame.GROUPCOL = '_group_'

// Special column name used for join column.
DataFrame.JOINCOL = '_join_'

// All special names (used for internal lookup).
DataFrame.SPECIAL_NAMES = new Set([DataFrame.GROUPCOL, DataFrame.JOINCOL])
