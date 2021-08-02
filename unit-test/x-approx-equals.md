{% if include.problem %}

1.  Write a function `assertApproxEqual` that does nothing if two values are within a certain tolerance of each other
    but throws an exception if they are not:

    ```js
    # throws exception
    assertApproxEqual(1.0, 2.0, 0.01, 'Values are too far apart')
    
    # does not throw
    assertApproxEqual(1.0, 2.0, 10.0, 'Large margin of error')
    ```

2.  Modify the function so that a default tolerance is used if none is specified:

    ```js
    # throws exception
    assertApproxEqual(1.0, 2.0, 'Values are too far apart')
    
    # does not throw
    assertApproxEqual(1.0, 2.0, 'Large margin of error', 10.0)
    ```

3.  Modify the function again so that it checks the <span g="relative_error">relative error</span>
    instead of the <span g="absolute_error">absolute error</span>.
    (The relative error is the absolute value of the difference between the actual and expected value,
    divided by the absolute value.)

{% else %}

FIXME: write solution.

{% endif %}
