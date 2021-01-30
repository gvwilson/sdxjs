#!/usr/bin/env node

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
  _DATE: (new Date()).toISOString().split('T')[0]
}

/**
 * Template for overall atom.xml file.
 */
const ATOM_FEED = `
<?xml version="1.0" encoding="utf-8"?>
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
</feed>
`

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
  const [ configFile, srcDir, dstDir, blogSubDir, linksFile ] = process.argv.slice(2)
  const site = yamlLoad(configFile)
  const linksText = buildLinks({ links: linksFile })
  const posts = glob.sync(`${srcDir}/*.md`)
    .map(filename => loadFile(filename))
  const metadata = STANDARD_METADATA
  writeIndex(dstDir, metadata, posts)
  const blogDir = path.join(dstDir, blogSubDir)
  writeHome(site, blogDir, posts, linksText)
  posts.forEach(post => writePost(site, blogDir, post, linksText))
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
 * Write index of all available posts as Atom file.
 * @param {string} dstDir Destination directory.
 * @param {object} metadata Overall information about blog.
 * @param {Array<object>} posts All posts.
 */
const writeIndex = (dstDir, metadata, posts) => {
  fs.mkdirSync(dstDir, { recursive: true })
  let text = ATOM_FEED
  for (let key in metadata) {
    text = text.replace(new RegExp(key, 'g'), metadata[key])
  }
  text = text.replace(new RegExp('_POSTS', 'g'),
                      posts.map(post => postToXml(metadata, post)).join('\n'))
  fs.writeFileSync(path.join(dstDir, 'atom.xml'), text, 'utf-8')
}

/**
 * Convert a single post to XML for inclusion in atom.xml.
 * @param {object} metadata Information about blog as a whole.
 * @param {object} post Information about post.
 * @returns {string} Post formatted as XML.
 */
const postToXml = (metadata, post) => {
  const html = 'FIXME'
  const postId = `${post.date.replace(new RegExp('-', 'g'), '/')}/${post.slug}`
  return ATOM_POST
    .replace(new RegExp('_TITLE', 'g'), post.data.title)
    .replace(new RegExp('_URL', 'g'), metadata._URL)
    .replace(new RegExp('_ID', 'g'), postId)
    .replace(new RegExp('_DATE', 'g'), post.date)
    .replace(new RegExp('_HTML', 'g'), html)
}

/**
 * Write the blog home page.
 * @param {object} site Information about the site as a whole.
 * @param {string} blogDir Root directory for blog posts.
 * @param {Array<object>} posts All posts.
 * @param {string} linksText Lookup table of Markdown links.
 */
const writeHome = (site, blogDir, posts, linksText) => {
  fs.mkdirSync(blogDir, { recursive: true })
  const mdi = new MarkdownIt({ html: true })
  const context = {
    root: '.'
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
  const text = `${HEADER}\n<ul>\n${posts}\n</ul>\n${FOOTER}\n${linksText}`
  const translated = ejs.render(text, settings, context)
  const html = mdi.render(translated)
  fs.writeFileSync(path.join(blogDir, 'index.html'), html, 'utf-8')
}

/**
 * Write a single post.
 * @param {object} site Information about the site as a whole.
 * @param {string} blogDir Destination directory.
 * @param {object} post Information about this post.
 * @param {string} linksText Lookup table of Markdown links.
 */
const writePost = (site, blogDir, post, linksText) => {
  const [ postYear, postMonth, postDay ] = post.date.split('-')
  const postDir = path.join(blogDir, postYear, postMonth, postDay, post.slug)
  fs.mkdirSync(postDir, { recursive: true })

  const postPath = path.join(postDir, 'index.html')
  const mdi = new MarkdownIt({ html: true })
  const context = {
    root: '.',
    filename: post.filename
  }
  const settings = {
    site,
    page: post.data,
    toRoot: '../../../../..' // ./blog/year/month/day/slug/index.html
  }
  const text = `${HEADER}\n${post.content}\n${FOOTER}\n${linksText}`
  const translated = ejs.render(text, settings, context)
  const html = mdi.render(translated)
  fs.writeFileSync(postPath, html, 'utf-8')
}

main()
