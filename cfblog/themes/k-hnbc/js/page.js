document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const pageInfo = document.querySelector('.page-info');
    
    let isLoading = false;
    let hasNextPage = true;
    let currentPage = 1;
    let loadedUrls = new Set(); // 防止死循环

    const isMobile = window.innerWidth <= 768;

    // 初始化底部提示文字
    if (loadMoreBtn) {
        if (isMobile) {
            loadMoreBtn.style.display = 'none';
            loadMoreBtn.style.cursor = 'default';
            loadMoreBtn.style.pointerEvents = 'none';
        } else {
            loadMoreBtn.classList.add('show');
            loadMoreBtn.innerText = '点击加载更多文章';
        }
    }

    function showEndTip() {
        hasNextPage = false;
        if (loadMoreBtn) {
            loadMoreBtn.innerText = '— 已经到底啦 —';
            loadMoreBtn.disabled = true;
            
            if (isMobile) {
                loadMoreBtn.style.display = 'block'; 
                loadMoreBtn.style.pointerEvents = 'auto'; 
            } else {
                loadMoreBtn.style.opacity = '0.5';
            }
        }
    }

    async function loadNextPage() {
        if (isLoading || !hasNextPage) return;
        
        // 👇 修复点 1：改成了 btn-next
        const currentNextBtn = document.getElementById('btn-next');
        
        if (!currentNextBtn || !currentNextBtn.getAttribute('href') || currentNextBtn.getAttribute('href') === "javascript:;" || currentNextBtn.getAttribute('href').endsWith('#')) {
            showEndTip();
            return;
        }

        let nextUrl = currentNextBtn.getAttribute('href');

        if (loadedUrls.has(nextUrl)) {
            showEndTip();
            return;
        }

        isLoading = true;
        loadedUrls.add(nextUrl); 
        
        if (loadMoreBtn) {
            loadMoreBtn.innerText = '正在加载...';
            if (!isMobile) {
                loadMoreBtn.style.opacity = '0.5';
            } else {
                loadMoreBtn.style.display = 'block'; 
            }
        }

        try {
            const response = await fetch(nextUrl, { cache: 'no-store' });
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            const newItems = doc.querySelectorAll('.list-item'); 
            
            if (newItems.length > 0) {
                const currentItems = document.querySelectorAll('.list-item');
                const lastItem = currentItems[currentItems.length - 1];
                
                newItems.forEach(item => {
                    if(lastItem) {
                        lastItem.parentNode.insertBefore(item, lastItem.nextSibling);
                    } else {
                        document.querySelector('.list-grid').appendChild(item);
                    }
                });

                if (!isMobile) {
                    window.history.pushState({}, '', nextUrl);
                }

                currentPage++;
                if (pageInfo) {
                    const newPageInfo = doc.querySelector('.page-info');
                    if (newPageInfo) {
                        pageInfo.innerText = newPageInfo.innerText;
                    } else {
                        currentPage++;
                        pageInfo.innerText = `第 ${currentPage} 页`;
                    }
                }
                
                const newPagination = doc.querySelector('.custom-pagination');
                const currentPagination = document.querySelector('.custom-pagination');
                
                if (newPagination && currentPagination) {
                    currentPagination.innerHTML = newPagination.innerHTML;
                    
                    // 替换完后，重新触发禁用状态判断
                    if(typeof window.updatePaginationState === 'function') {
                      window.updatePaginationState();
                    }

                    // 👇 修复点 2：改成了 btn-next
                    const updatedNextBtn = document.getElementById('btn-next');
                    
                    if (updatedNextBtn && updatedNextBtn.getAttribute('href') && updatedNextBtn.getAttribute('href') !== "javascript:;" && !updatedNextBtn.getAttribute('href').endsWith('#')) {
                        if (loadMoreBtn) {
                            if (!isMobile) {
                                loadMoreBtn.innerText = '点击加载更多文章';
                                loadMoreBtn.style.opacity = '1';
                            } else {
                                loadMoreBtn.style.display = 'none';
                            }
                        }
                    } else {
                        showEndTip();
                    }
                } else {
                    showEndTip();
                }
                
            } else {
                showEndTip();
            }
        } catch (error) {
            console.error('加载失败', error);
            if (loadMoreBtn && !isMobile) {
                loadMoreBtn.innerText = '加载失败，点击重试';
                loadMoreBtn.style.opacity = '1';
            }
            loadedUrls.delete(nextUrl); 
        } finally {
            isLoading = false;
        }
    }

    // PC 端
    if (!isMobile && loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadNextPage);
    }

    // 移动端
    if (isMobile) {
        window.addEventListener('scroll', function() {
            if (isLoading || !hasNextPage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
                loadNextPage();
            }
        });
        
        setTimeout(() => {
            if (document.body.offsetHeight <= window.innerHeight) {
                loadNextPage();
            }
        }, 500);
    }
});