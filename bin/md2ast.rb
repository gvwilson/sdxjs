#!/usr/bin/env ruby

# Use Kramdown parser to produce AST for Markdown document.
# - input is GitHub Flavored Markdown
# - suppress auto-IDs (only generate labels where explicitly indicated)

require "kramdown"
require "kramdown-parser-gfm"
require "json"

markdown = STDIN.read()
doc = Kramdown::Document.new(markdown, input: 'GFM', auto_ids: false, html_to_native: true)
tree = doc.to_hash_a_s_t
puts JSON.pretty_generate(tree)
