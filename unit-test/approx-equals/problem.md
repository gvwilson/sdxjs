1.  Write a function `assertApproxEqual` that does nothing if two values are within a certain tolerance of each other
    but throws an exception if they are not:

```js
assertApproxEqual(1.0, 2.0, 0.01, 'Values are too far apart') # throws exception
assertApproxEqual(1.0, 2.0, 10.0, 'That's quite a margin of error') # does not throw
```

2.  Modify the function so that a default tolerance is used if none is specified:

```js
assertApproxEqual(1.0, 2.0, 'Values are too far apart') # throws exception
assertApproxEqual(1.0, 2.0, 'That's quite a margin of error', 10.0) # does not throw
```

3.  Modify the function again so that it checks the <g key="relative_error">relative error</g>
    instead of the <g key="absolute_error">absolute error</g>.
    (The relative error is the absolute value of the difference between the actual and expected value,
    divided by the absolute value.)
