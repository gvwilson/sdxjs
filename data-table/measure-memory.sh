for numCol in $(seq 10 10 50)
do
    node measure-memory.js rows 1000 $numCol
    node measure-memory.js cols 1000 $numCol
done
