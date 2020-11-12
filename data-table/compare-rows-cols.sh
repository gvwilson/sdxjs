for numCol in $(seq 10 10 50)
do
    node compare-rows-cols.js rows 1000 $numCol
    node compare-rows-cols.js cols 1000 $numCol
done
