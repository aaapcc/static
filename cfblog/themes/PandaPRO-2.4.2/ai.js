jQuery(document).ready(function ($) {
    var summaryText = $('#chatgpt-summary').text().trim();

    // 调试：检查摘要文本是否正确获取
    console.log('Summary Text:', summaryText);  // 查看是否输出摘要文本

    if (summaryText.length > 0 && summaryText !== "生成中...") {
        var i = 0;
        var summaryContainer = $('#chatgpt-summary');

        // 清空现有内容，准备逐字显示
        summaryContainer.text('');

        function typeWriter() {
            if (i < summaryText.length) {
                summaryContainer.append(summaryText.charAt(i));
                i++;
                setTimeout(typeWriter, 100);  // 每100毫秒打一个字
            }
        }

        typeWriter();
    } else {
        // 如果摘要正在生成中
        console.log('Summary is still being generated...');
    }
});