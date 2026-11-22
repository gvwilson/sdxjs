-- shortcodes.lua
-- Handlers for the book's {{< ... >}} shortcodes: inc and linecount.
-- (The glossary {{< g >}} shortcode lives in glossary.lua.)

local root = quarto.project.directory or "."

-- Shortcode args arrive as strings; a missing named arg is an empty string.
local function s(v)
  if type(v) == "string" and v ~= "" then return v end
end

local LANG = { js = "javascript", sh = "bash" }

local function trim(x)
  return (x:match("^%s*(.-)%s*$"))
end

-- JavaScript line-comment markers: // mccole:name ... // mccole:/name.
local function extract_region(content, mark)
  local start_marker = "// mccole:" .. mark
  local end_marker = "// mccole:/" .. mark
  local in_region = false
  local lines = {}
  for line in (content .. "\n"):gmatch("(.-)\n") do
    local stripped = trim(line)
    if not in_region then
      if stripped == start_marker then in_region = true end
    else
      if stripped == end_marker then break end
      lines[#lines + 1] = line
    end
  end
  return table.concat(lines, "\n")
end

local function omit_region(content, mark)
  local start_marker = "// mccole:" .. mark
  local end_marker = "// mccole:/" .. mark
  local in_region = false
  local lines = {}
  for line in (content .. "\n"):gmatch("(.-)\n") do
    local stripped = trim(line)
    if stripped == start_marker then
      in_region = true
    elseif in_region and stripped == end_marker then
      in_region = false
    elseif not in_region then
      lines[#lines + 1] = line
    end
  end
  return table.concat(lines, "\n")
end

local function head_lines(content, n)
  local lines = {}
  for line in content:gmatch("([^\n]*)\n") do
    lines[#lines + 1] = line
    if #lines == n then break end
  end
  return table.concat(lines, "\n")
end

return {
  -- code include: {{< inc path/to/file.js mark=name omit=name head="N" >}}
  ["inc"] = function(args, kwargs, meta)
    local file = s(args[1])
    local mark = s(kwargs["mark"])
    local omit = s(kwargs["omit"])
    local head = tonumber(s(kwargs["head"]) or "")
    local f = assert(io.open(root .. "/" .. file, "r"), "inc: cannot open " .. file)
    local content = f:read("*all")
    f:close()
    local code = mark and extract_region(content, mark) or content
    if omit then code = omit_region(code, omit) end
    if head then code = head_lines(code, head) end
    local ext = file:match("%.([^.]+)$") or ""
    local lang = LANG[ext] or ""
    local classes = (lang ~= "") and { lang } or {}
    return pandoc.Blocks({ pandoc.CodeBlock(code, pandoc.Attr("", classes, {})) })
  end,

  -- line count: {{< linecount path/to/file >}}
  ["linecount"] = function(args, kwargs, meta)
    local file = s(args[1])
    local f = assert(io.open(root .. "/" .. file, "r"), "linecount: cannot open " .. file)
    local n = 0
    for _ in f:lines() do n = n + 1 end
    f:close()
    return pandoc.Str(tostring(n))
  end,
}
