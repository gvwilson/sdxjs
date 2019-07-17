{%- comment -%}
Bibliography citation. Use as {% include cite.md keys="A,B,C" %}.
{%- endcomment -%}
{%- assign keys = include.keys | split: ',' -%}
<span class="cite">[{%- for key in keys -%}[{{key | strip}}]({% if page.permalink == '/' %}.{% else %}..{% endif %}/references/#{{key | strip | downcase}}){%- unless forloop.last -%},{%- endunless -%}{%- endfor -%}]</span>