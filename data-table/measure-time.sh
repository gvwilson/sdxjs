echo 'operation,layout,rows,cols,time'
for numCol in $(seq 10 10 50)
do
    node measure-time.js rows 1000 $numCol
    node measure-time.js cols 1000 $numCol
done
