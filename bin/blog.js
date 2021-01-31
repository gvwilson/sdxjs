#!/usr/bin/env node

import argparse from 'argparse'
import assert from 'assert'
import ejs from 'ejs'
import fs from 'fs'
import glob from 'glob'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import path from 'path'

import {
  buildLinks,
  yamlLoad
} from './utils.js'

/**
 * Posts must be named YYYY-MM-DD-title-with-dashes.md
 */
const POST_FILENAME = /(\d{4}-\d{2}-\d{2})-(.+)\.md/

/**
 * Standard metadata for site.
 */
const STANDARD_METADATA = {
  _URL: 'https://stjs.tech',
  _AUTHOR: 'Greg Wilson',
  _EMAIL: 'info@stjs.tech',
  _DATE: null
}

/**
 * Template for overall atom.xml file.
 */
const ATOM_FEED = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">

 <title>Software Tools in JavaScript</title>
 <link href="/atom.xml" rel="self"/>
 <link href="/"/>
 <updated>_DATE</updated>
 <id>_URL</id>
 <author>
   <name>_AUTHOR</name>
   <email>_EMAIL</email>
 </author>
_POSTS
</feed>`

/**
 * Template for individual post.
 */
const ATOM_POST = `
 <entry>
   <title>_TITLE</title>
   <link href="_URL"/>
   <updated>_DATE</updated>
   <id>_URL/_ID</id>
   <content type="html">_HTML</content>
 </entry>
`

/**
 * Header inclusion.
 */
const HEADER = "<%- include('/inc/post-head.html') %>"

/**
 * Footer inclusion.
 */
const FOOTER = "<%- include('/inc/post-foot.html') %>"

/**
 * Main driver.
 */
const main = () => {
  const options = getOptions()
  const site = yamlLoad(options.common)
  buildLinks(options)
  const posts = glob.sync(`${options.source}/*.md`)
    .map(filename => loadFile(filename))
  const maxDate = getMaxDate(posts)
  const metadata = Object.assign({}, STANDARD_METADATA, { _DATE: maxDate })
  writeIndex(options, site, metadata, posts)
  writeHome(options, site, posts)
  posts.forEach(post => writePost(options, site, post))
}

/**
 * Get command-line options.
 * @returns {object} Options.
 */
const getOptions = () => {
  const parser = new argparse.ArgumentParser()
  parser.add_argument('--blog')
  parser.add_argument('--common')
  parser.add_argument('--docs')
  parser.add_argument('--links')
  parser.add_argument('--root')
  parser.add_argument('--source')
  return parser.parse_args()
}

/**
 * Load file, extracting YAML headers.
 * @param {string} filename Path to file.
 * @returns {object} File contents, header, etc.
 */
const loadFile = (filename) => {
  const fields = filename.match(POST_FILENAME)
  assert(fields,
    `Filename "${filename}" is improperly formatted.`)
  const date = fields[1]
  const slug = fields[2]
  const { data, content } = matter(fs.readFileSync(filename, 'utf-8'))
  return { filename, date, slug, data, content }
}

/**
 * Get the maximum date from all posts.
 * @param {Array<object>} posts All posts.
 * @returns Greatest date (as YYYY-MM-DD string).
 */
const getMaxDate = (posts) => {
  let result = posts[0].date
  posts.forEach(post => {
    if (post.date > result) {
      result = post.date
    }
  })
  return result
}

/**
 * Write index of all available posts as Atom file.
 * @param {object} options Program options.
 * @param {object} site Overall site information.
 * @param {object} metadata Overall information about blog.
 * @param {Array<object>} posts All posts.
 */
const writeIndex = (options, site, metadata, posts) => {
  fs.mkdirSync(options.docs, { recursive: true })
  let text = ATOM_FEED
  for (let key in metadata) {
    text = text.replace(new RegExp(key, 'g'), metadata[key])
  }
  text = text.replace(
    new RegExp('_POSTS', 'g'),
    posts.map(post => postToXml(options, site, metadata, post)).join('\n')
  )
  fs.writeFileSync(path.join(options.docs, 'atom.xml'), text, 'utf-8')
}

/**
 * Convert a single post to XML for inclusion in atom.xml.
 * @param {object} options Program options.
 * @param {object} site Overall site information.
 * @param {object} metadata Information about blog as a whole.
 * @param {object} post Information about post.
 * @returns {string} Post formatted as XML.
 */
const postToXml = (options, site, metadata, post) => {
  const mdi = new MarkdownIt({ html: true })
  const context = {
    root: options.root,
    filename: post.filename
  }
  const settings = {
    site,
    page: post.data
  }
  const text = `${post.content}\n${options.linksText}`
  const translated = ejs.render(text, settings, context)
  const html = mdi.render(translated)
  const postId = `${post.date.replace(new RegExp('-', 'g'), '/')}/${post.slug}`
  return ATOM_POST
    .replace(new RegExp('_TITLE', 'g'), post.data.title)
    .replace(new RegExp('_URL', 'g'), metadata._URL)
    .replace(new RegExp('_ID', 'g'), postId)
    .replace(new RegExp('_DATE', 'g'), post.date)
    .replace(new RegExp('_HTML', 'g'), escape(html))
}

/**
 * Escape HTML.
 * @param {string} text Text to escape.
 * @returns {string} Text with characters escaped.
 */
const escape = (text) => {
  const lookup = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  return text.replace(/[&<>"]/g, (ch) => lookup[ch] || ch)
}

/**
 * Write the blog home page.
 * @param {object} options Program options.
 * @param {object} site Information about the site as a whole.
 * @param {Array<object>} posts All posts.
 */
const writeHome = (options, site, posts) => {
  const blogDir = path.join(options.docs, options.blog)
  fs.mkdirSync(blogDir, { recursive: true })
  const mdi = new MarkdownIt({ html: true })
  const context = {
    root: options.root
  }
  const settings = {
    site,
    page: {
      title: 'Blog'
    },
    toRoot: '..'
  }
  posts = posts.map(post => {
    const [ postYear, postMonth, postDay ] = post.date.split('-')
    const link = path.join('.', postYear, postMonth, postDay, post.slug)
    return `<li>${post.date}: <a href="./${link}/">${post.data.title}</a></li>`
  })
  const text = `${HEADER}\n<ul>\n${posts}\n</ul>\n${FOOTER}\n${options.linksText}`
  const translated = ejs.render(text, settings, context)
  const html = mdi.render(translated)
  fs.writeFileSync(path.join(blogDir, 'index.html'), html, 'utf-8')
}

/**
 * Write a single post.
 * @param {object} options Program options.
 * @param {object} site Information about the site as a whole.
 * @param {object} post Information about this post.
 */
const writePost = (options, site, post) => {
  const [ postYear, postMonth, postDay ] = post.date.split('-')
  const postDir = path.join(options.docs, options.blog, postYear, postMonth, postDay, post.slug)
  fs.mkdirSync(postDir, { recursive: true })

  const postPath = path.join(postDir, 'index.html')
  const mdi = new MarkdownIt({ html: true })
  const context = {
    root: options.root,
    filename: post.filename
  }
  const settings = {
    site,
    page: post.data,
    toRoot: '../../../../..' // ./blog/year/month/day/slug/index.html
  }
  const text = `${HEADER}\n${post.content}\n${FOOTER}\n${options.linksText}`
  const translated = ejs.render(text, settings, context)
  const html = mdi.render(translated)
  fs.writeFileSync(postPath, html, 'utf-8')
}

main()
