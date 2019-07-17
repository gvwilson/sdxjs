{%- capture content -%}{%- include_relative {{include.file}} -%}{%- endcapture -%}
{%- assign chunks = content | split: '/*+' -%}
```{{include.file | split: '.' | last }}
{% for chunk in chunks -%}
{%- if chunk contains '+*/' -%}
{%- assign commentAndCode = chunk | split: '+*/' -%}
{%- assign commentAndFilename = commentAndCode[0] | split: '+' -%}
// …{{commentAndFilename[0]}}…{{commentAndCode[1]}}
{%- else -%}
{{chunk}}
{%- endif -%}
{%- endfor -%}
```
{: title="{{include.file}}"}
