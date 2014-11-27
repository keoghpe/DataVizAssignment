power <- read.csv("all_week.csv", header=TRUE, na.strings="?")

chart.Correlation(power$latitude,power$longitude,power$depth,power$mag)