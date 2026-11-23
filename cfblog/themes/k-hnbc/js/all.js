// ==========================================
// 全局函数：复制验证码
// ==========================================
window.copyPromoCode = function(btnElement, text) {
  navigator.clipboard.writeText(text).then(() => {
    let copyBtn = btnElement;
    if (btnElement.classList.contains("promo-code")) {
      copyBtn = btnElement.parentElement.querySelector(".promo-btn-copy");
    }
    if (!copyBtn) return;

    const originalText = copyBtn.innerText;
    copyBtn.innerText = "已复制";
    copyBtn.style.color = "var(--green, #1aae19)"; 
    copyBtn.style.borderColor = "var(--green, #1aae19)";
    copyBtn.disabled = true; 

    setTimeout(() => {
      copyBtn.innerText = originalText;
      copyBtn.style.color = "";
      copyBtn.style.borderColor = "";
      copyBtn.disabled = false;
    }, 1500);
  }).catch(err => {
    alert("复制失败，请手动长按选择复制：" + text);
  });
};

// ==========================================
// 清理 Markdown 编辑器生成的冗余锚点
// ==========================================
document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6').forEach(heading => {
  heading.querySelectorAll('a.reference-link, span.header-link').forEach(el => el.remove());
  if (heading.id && !heading.id.startsWith('heading-')) {
    heading.removeAttribute('id');
  }
});

// ==========================================
// 提取到外层的核心：老文章排版拯救 (含头部包裹)
// ==========================================
const articleContent = document.querySelector('.article-content');

if (articleContent) {
  
  // 👇 安全修复版：处理第一个 h2 出现前的内容
  const firstNode = articleContent.firstChild;
  
  // 检查：如果有第一个节点，且它不是 h2，也不是提前写好的 section/div 结构
  if (firstNode && firstNode.nodeName !== 'H2' && articleContent.querySelector('h2')) {
    
    // 过滤掉纯文本节点（比如空格、回车），找到第一个真正的“元素节点”
    let realFirstElement = firstNode;
    while (realFirstElement && realFirstElement.nodeType !== 1) {
      realFirstElement = realFirstElement.nextSibling;
    }

    // 如果真正的第一个元素既不是 h2，也不是 section，说明是没包裹的散段落
    if (realFirstElement && realFirstElement.nodeName !== 'H2' && realFirstElement.nodeName !== 'SECTION') {
      
      const introSection = document.createElement('section');
      introSection.className = 'article-section';
      articleContent.insertBefore(introSection, firstNode);
      
      let node = firstNode;
      // 核心防呆：如果碰到 h2 或者 section，立刻停止吸收！
      while (node && node.nodeName !== 'H2' && node.nodeName !== 'SECTION') {
        const next = node.nextSibling; 
        introSection.appendChild(node); 
        node = next; 
      }
    }
  }

  // 👇 下面是你原有的遍历所有 h2 并包裹卡片的逻辑（保持不变）
  const h2s = Array.from(articleContent.querySelectorAll('h2'));

  h2s.forEach(h2 => {
    // 排除已经被包裹过的
    if (h2.closest('.article-section') || h2.closest('.article-quote-card')) {
      return;
    }

    const newSection = document.createElement('section');
    newSection.className = 'article-section';
    
    const newCard = document.createElement('div');
    newCard.className = 'article-quote-card';

    h2.parentNode.insertBefore(newSection, h2);
    
    const originalText = h2.innerHTML;
    h2.className = 'blue-msg-title';
    h2.innerHTML = `<span>${originalText}</span>`;
    
    newSection.appendChild(h2);
    newSection.appendChild(newCard);

    let nextNode = newSection.nextSibling;
    
    while (nextNode) {
      const isNextH2 = nextNode.nodeName === 'H2';
      const isFaqWrap = nextNode.nodeType === 1 && nextNode.classList.contains('faq-wrap');
      const isEnding = nextNode.nodeType === 1 && nextNode.classList.contains('article-ending');

      if (isNextH2 || isFaqWrap || isEnding) {
        break;
      }

      const tempNext = nextNode.nextSibling;
      newCard.appendChild(nextNode);
      nextNode = tempNext;
    }
  });

  // 👇 延迟 200 毫秒后显示，让加载动画能露个脸
  setTimeout(() => {
    articleContent.classList.add('rendered');
  }, 200); 
}



// ==========================================
// 页面交互逻辑 (等待 DOM 加载完成后执行)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  
  // --- 0. 公共 DOM 变量获取 ---
  const openMenuBtn = document.getElementById("openMenuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const sideSearchTrigger = document.getElementById("sideSearchTrigger");
  
  const openSearchBtn = document.getElementById("openSearchBtn");
  const closeSearchBtn = document.getElementById("closeSearchBtn");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("searchInput");
  const searchHistoryBox = document.getElementById("searchHistoryBox");
  const historyTags = document.getElementById("historyTags");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const searchForm = document.getElementById("searchForm");

  const headerNav = document.getElementById("headerNav");
  const navMain = document.getElementById("navMain");
  const navMore = document.getElementById("navMore");
  const dropdown = document.getElementById("navMoreDropdown");
  const navLinks = Array.from(navMain.querySelectorAll("a"));

  const openTocBtn = document.getElementById("openTocBtn");
  const closeTocBtn = document.getElementById("closeTocBtn");
  const tocModal = document.getElementById("tocModal");


  // --- 1. 代码高亮 & 复制 & 行号 ---
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }

  document.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;

    const codeText = code.textContent || "";
    const lines = codeText.split('\n');
    if (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

    const highlightedLines = code.innerHTML.split('\n');
    
    let newHtml = '';
    lines.forEach((_, index) => {
      newHtml += `<div class="code-line">`;
      newHtml += `<span class="line-num">${index + 1}</span>`;
      newHtml += `<span class="line-text">${highlightedLines[index] || ' '}</span>`;
      newHtml += `</div>`;
    });

    code.innerHTML = newHtml;
    pre.classList.add("has-line-numbers");

    let lang = "code";
    const classList = Array.from(code.classList);
    const langClass = classList.find(c => c.startsWith("language-") || c.startsWith("lang-")) || classList.find(c => c !== "hljs");

    if (langClass) {
      lang = langClass.replace("language-", "").replace("lang-", "");
    }
    pre.setAttribute("data-lang", lang);
    
    pre.addEventListener("click", (e) => {
      const rect = pre.getBoundingClientRect();
      if (e.clientY - rect.top < 40 && e.clientX > rect.right - 100) {
        const contentToCopy = Array.from(code.querySelectorAll('.line-text'))
                                   .map(el => el.textContent)
                                   .join('\n');
        
        navigator.clipboard.writeText(contentToCopy).then(() => {
          pre.classList.add("copied");
          setTimeout(() => pre.classList.remove("copied"), 1500);
        }).catch((err) => console.error("复制失败: ", err));
      }
    });
  });


  // --- 2. PC端顶部导航多级菜单 ---
  const pcActiveSubItem = document.querySelector('.nav-main .sub-menu li.active');
  if (pcActiveSubItem) {
    const parentLi = pcActiveSubItem.closest('.nav-main > li');
    if (parentLi) {
      parentLi.classList.add('active');
    }
  }

  const moreDropdown = document.getElementById("navMoreDropdown");
  if (moreDropdown) {
    moreDropdown.addEventListener("mouseover", (e) => {
      const li = e.target.closest("li:has(> .sub-menu)");
      if (!li) return;

      li.classList.remove("flip-left");

      const rect = li.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const remainingRightSpace = windowWidth - rect.right;

      if (remainingRightSpace < 200) {
        li.classList.add("flip-left");
      }
    });
  }

  const checkNavOverflow = () => {
    if (window.innerWidth <= 820) return;
    navMore.classList.remove("show");
    dropdown.innerHTML = "";
    
    const navItems = Array.from(navMain.children);
    navItems.forEach(li => li.style.display = "");

    const moreBtnWidth = navMore.querySelector('.nav-more-btn').offsetWidth || 40;
    const availableWidth = headerNav.offsetWidth - moreBtnWidth - 20;

    if (navMain.scrollWidth > availableWidth) {
      navMore.classList.add("show");
      for (let i = navItems.length - 1; i >= 0; i--) {
        const li = navItems[i];
        li.style.display = "none"; 
        const clone = li.cloneNode(true); 
        clone.style.display = "block";
        dropdown.prepend(clone); 
        if (navMain.scrollWidth <= availableWidth) break;
      }
    }
  };


  // --- 3. 移动端侧边栏多级菜单 ---
  document.querySelectorAll('.mobile-menu-inner > li').forEach(li => {
    const subMenu = li.querySelector(':scope > .sub-menu');
    if (!subMenu) return;
    if (li.querySelector('.mobile-sub-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'mobile-sub-btn';
    btn.innerHTML = '<i class="iconfont icon-right"></i>'; 
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      e.preventDefault();
      const isCurrentlyOpen = btn.classList.contains('open');

      document.querySelectorAll('.mobile-menu-inner > li').forEach(otherLi => {
        const otherBtn = otherLi.querySelector('.mobile-sub-btn');
        const otherSubMenu = otherLi.querySelector(':scope > .sub-menu');
        if (otherLi !== li && otherBtn && otherSubMenu) {
          otherBtn.classList.remove('open');
          otherSubMenu.classList.remove('show');
        }
      });

      btn.classList.toggle('open', !isCurrentlyOpen);
      subMenu.classList.toggle('show', !isCurrentlyOpen);
    });

    li.appendChild(btn);
  });

  const activeSubItem = document.querySelector('.mobile-menu-inner .sub-menu li.active');
  if (activeSubItem) {
    const parentLi = activeSubItem.closest('.mobile-menu-inner > li');
    if (parentLi) {
      const parentBtn = parentLi.querySelector('.mobile-sub-btn');
      const parentSubMenu = parentLi.querySelector(':scope > .sub-menu');
      if (parentBtn) parentBtn.classList.add('open');
      if (parentSubMenu) parentSubMenu.classList.add('show');
    }
  }
  
  requestAnimationFrame(checkNavOverflow);
  let navTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(navTimeout);
    navTimeout = setTimeout(checkNavOverflow, 100);
  });


  // --- 4. 侧边栏开关 ---
  if (openMenuBtn) {
    openMenuBtn.addEventListener("click", () => {
      sideMenu.classList.add("show");
      menuOverlay.classList.add("show");
      document.body.classList.add("modal-open");
    });
  }
  const closeMenu = () => {
    sideMenu.classList.remove("show");
    menuOverlay.classList.remove("show");
    document.body.classList.remove("modal-open");
  };
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);
  document.querySelectorAll(".menu-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });


  // --- 5. 搜索弹窗逻辑 ---
  const getHistory = () => {
    try { return JSON.parse(localStorage.getItem("myBlogSearchHistory")) || []; } 
    catch (e) { return []; }
  };

  const renderHistory = () => {
    const history = getHistory();
    if (history.length === 0) {
      searchHistoryBox.style.display = "none";
      return;
    }
    searchHistoryBox.style.display = "block";
    historyTags.innerHTML = history.map(tag => `<span class="hint-tag">${tag}</span>`).join("");

    document.querySelectorAll("#historyTags .hint-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        searchInput.value = tag.innerText;
        saveHistory(tag.innerText);
        if (searchForm) {
          searchForm.requestSubmit();
        }
      });
    });
  };

  const saveHistory = (keyword) => {
    let history = getHistory().filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem("myBlogSearchHistory", JSON.stringify(history));
    renderHistory();
  };

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      localStorage.removeItem("myBlogSearchHistory");
      renderHistory();
    });
  }

  const openSearchPanel = () => {
    searchOverlay.classList.remove("no-overlay-bg");
    searchOverlay.classList.add("show");
    searchPanel.classList.add("show");
    document.body.classList.add("modal-open");
    renderHistory(); 
    searchInput.focus(); 
    searchInput.click(); 
  };

  const closeSearch = () => {
    searchOverlay.classList.remove("show");
    searchPanel.classList.remove("show");
    searchInput.value = ""; 
    searchOverlay.classList.remove("no-overlay-bg");
    if (menuOverlay && menuOverlay.classList.contains("show")) {
      menuOverlay.classList.remove("show");
    }
    document.body.classList.remove("modal-open");
  };

  if (openSearchBtn) {
    openSearchBtn.addEventListener("click", openSearchPanel);
  }
  if (closeSearchBtn) closeSearchBtn.addEventListener("click", closeSearch);
  if (searchOverlay) searchOverlay.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchPanel.classList.contains("show")) closeSearch();
  });

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      const keyword = searchInput.value.trim();
      if (keyword !== "") {
        saveHistory(keyword);
      } else {
        e.preventDefault(); 
      }
    });
  }


  // --- 6. 侧边栏搜索联动 ---
  if (sideSearchTrigger) {
    sideSearchTrigger.addEventListener("click", () => {
      sideMenu.classList.add("no-transition");
      sideMenu.classList.remove("show");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sideMenu.classList.remove("no-transition");
        });
      });
      
      if (searchOverlay && searchPanel) {
        searchOverlay.classList.add("no-overlay-bg");
        searchOverlay.classList.add("show"); 
        searchPanel.classList.add("show"); 
        document.body.classList.add("modal-open");
        if (typeof renderHistory === 'function') renderHistory();
        searchInput.focus(); 
        searchInput.click(); 
      }
    });
  }


  // --- 7. 文章目录弹窗 (动态加载当前分类文章) ---
  if (openTocBtn) {
    openTocBtn.addEventListener("click", async () => {
      tocModal.showModal();
      document.body.classList.add("modal-open");
      
      const tocListEl = document.getElementById("tocDynamicList");
      tocListEl.innerHTML = '<div style="padding: 20px; text-align: center;">加载中...</div>';

      const titleText = openTocBtn.innerText.trim();
      const categoryName = titleText.split('·')[0];

      // 👇 直接请求我们刚刚写的 API
      try {
        const res = await fetch(`/api/category/${encodeURIComponent(categoryName)}`);
        const articles = await res.json(); // 直接拿 JSON 数据！
        
        if (articles.length === 0) {
          tocListEl.innerHTML = '<div style="padding: 20px; text-align: center;">该分类下暂无文章</div>';
          return;
        }

        const currentUrl = window.location.pathname;
        let html = '';
        
        // 遍历 JSON 数组渲染
        articles.forEach(article => {
          const href = `/article/${article.id}.html`;
          const title = article.title;
          const isActive = currentUrl.includes(href) ? 'active' : '';

          html += `
            <a href="${href}" class="${isActive}">
              <span>${title}</span>
            </a>
          `;
        });

        tocListEl.innerHTML = html;

      } catch (err) {
        tocListEl.innerHTML = '<div style="padding: 20px; text-align: center;">加载失败，请重试</div>';
      }
    });
  }

  // 关闭弹窗逻辑（保持你原来的）
  const closeTocModal = () => {
    tocModal.classList.add("closing");
    setTimeout(() => {
      tocModal.close();
      tocModal.classList.remove("closing");
      document.body.classList.remove("modal-open");
    }, 300); 
  };
  
  if (closeTocBtn) closeTocBtn.addEventListener("click", closeTocModal);
  if (tocModal) {
    tocModal.addEventListener("click", (e) => {
      const rect = tocModal.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      if (!isInDialog) closeTocModal();
    });
  }


  // --- 8. Markdown 表格包裹滚动容器 ---
  document.querySelectorAll('.article-content table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrap';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });


  // --- 9. 返回顶部按钮 ---
  const backToTopBtn = document.getElementById("backToTop");
  
  if (backToTopBtn) {
    let isHiding = false; 

    window.addEventListener("scroll", () => {
      const triggerDistance = window.innerHeight * 1.5; 
      
      if (window.scrollY > triggerDistance) {
        isHiding = false;
        backToTopBtn.classList.remove("hiding");
        backToTopBtn.classList.add("show");
      } else {
        if (backToTopBtn.classList.contains("show") && !isHiding) {
          isHiding = true;
          backToTopBtn.classList.remove("show");
          backToTopBtn.classList.add("hiding");

          setTimeout(() => {
            if (isHiding) {
              backToTopBtn.classList.remove("hiding");
              isHiding = false;
            }
          }, 300);
        }
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }


  // --- 10. FAQ 常见问题手风琴排他 ---
  const faqTitles = document.querySelectorAll('.faq-title');
  
  faqTitles.forEach(title => {
    title.addEventListener('click', () => {
      const currentItem = title.parentElement;
      const isActive = currentItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        currentItem.classList.add('active');
      }
    });
  });


  // --- 11. 顶部导航 & 侧边栏：当前栏目高亮 (双端版) ---
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(p => p);
  let currentCategory = null;
  let isHomePage = false;

  // 1. 判断是否是首页 (URL 是 / 或 /page/数字)
  if (pathSegments.length === 0 || (pathSegments[0] === 'page' && pathSegments.length === 2)) {
    isHomePage = true;
  }

  // 2. 获取当前分类名
  if (pathSegments[0] === 'category' && pathSegments[1]) {
    currentCategory = decodeURIComponent(pathSegments[1]);
  } else if (pathSegments[0] === 'article') {
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb-nav a');
    if (breadcrumbLinks.length >= 2) {
      currentCategory = breadcrumbLinks[1].innerText.trim();
    }
  }

  // 3. 遍历 PC 端和移动端的所有菜单链接，进行高亮
  document.querySelectorAll('.nav-main > li, .mobile-menu-inner > li').forEach(li => {
    const a = li.querySelector('a');
    if (!a) return;
    const linkName = a.innerText.trim();
    const linkHref = a.getAttribute('href') || "";

    // 如果是首页，且菜单名字是"首页"（或者链接是 /）
    if (isHomePage && (linkName === "首页" || linkHref === "/")) {
      li.classList.add('active');
    }
    // 如果是分类页，且菜单名字等于分类名
    else if (currentCategory && linkName === currentCategory) {
      li.classList.add('active');
    }
  });


  // ==========================================
  // 13. 分页按钮 disabled 状态控制 (纯 JS 自动挡)
  // ==========================================
  const firstBtn = document.getElementById("btn-first");
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const lastBtn = document.getElementById("btn-last");

  // 第一页时，给首页和上一页加 disabled
  if (prevBtn && prevBtn.getAttribute("href") === "javascript:;") {
    firstBtn.classList.add("disabled");
    prevBtn.classList.add("disabled");
  }

  // 最后一页时，给下一页和尾页加 disabled
  if (nextBtn && nextBtn.getAttribute("href") === "javascript:;") {
    nextBtn.classList.add("disabled");
    lastBtn.classList.add("disabled");
  }

});