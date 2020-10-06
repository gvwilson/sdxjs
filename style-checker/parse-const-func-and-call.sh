node parse-const-func-and-call.js | head -n 30 > parse-const-func-and-call.text
echo "...$(expr $(node parse-const-func-and-call.js | wc -l) - 30) more lines..." >> parse-const-func-and-call.text
