
// // 执行
// window.addEventListener("load", function(event) {
//     console.log("文档以及它包含的资源都已加载完成");
//     initPage();
//   });

function initListData(listData) {
    const tBody = document.querySelector('#listTable > tbody');
    // HTML 模板
    const trTemplate = `<tr>
    <td class="sorting_1">
    <div class="feed-element">
      <div class="media-body">
        <strong>{{name}}</strong>
        <br>
        <strong class="text-red">LV:{{level}}</strong>
        <br>
        <small class="text-muted">ID:{{id}}</small>
      </div>
    </div>
    </td>
    <td><span class="{{stateClassName}}">{{state}}</span></td>
    <td>{{nickname}}</td>
    <td><strong>{{phone}}</strong></td>
    <td>{{identityId}}</td>
    <td class="zidonghuoqu_jiguan">{{location}}</td>
    <td class="zidonghuoqu_nianling">{{age}}</td>
    <td class="zidonghuoqu_shengri">{{birth}}</td>
    <td><strong>{{identityName}}</strong></td>
    <td>{{date}}</td>
  </tr>`;

    serializationData(listData);

    // 将多行数据替换至模板中
    const trListHtml = listData.map(item => {
        const placeholderMatchs = trTemplate.match(/{{[^}]+}}/g);
        // console.log('placeholderMatchs', placeholderMatchs);

        let html = trTemplate;
        placeholderMatchs.forEach(placeholder => {
            const key = placeholder.replace(/{{|}}/g, '');
            html = html.replace(placeholder, item[key] || ''); // 替换占位符为对应的数据
        });
        return html;
    });

    tBody.innerHTML = trListHtml.join(''); // OK
}

// 序列化列表数据
function serializationData(data) {
    // 拆分身份证号的正则
    const idReg = /^(\d{6})(\d{4})(\d{2})(\d{2})(.+)$/;
    const dict = window.dictForId || [];
    const now = Date.now();
    // 一年的毫秒数。当年份可以整除4或400时那一年是闰年，366天。其他年份是365天
    const yearTime = 365 * 24 * 60 * 60000; // 暂固定为一年365天
    data.forEach(item => {
        const idInfoMatched = item.identityId.match(idReg);
        if (idInfoMatched) {
            const [_, locationCode, year, month, day, endCode] = idInfoMatched;
            // console.log('idInfoMatched', idInfoMatched);
            console.log(locationCode, year, month, day, endCode);
            // 生日
            item.birth = `${year}年${month}月${day}日`;
            // 年龄
            item.age = Math.floor((now - new Date(`${year}/${month}/${day}`).getTime()) / yearTime);
            // 地区
            const locationDict = dict.find(dItem => dItem.code === locationCode);
            if (locationDict) {
                item.location = locationDict.name;
            }
        }
    // 处理状态
        let stateClassName = '';
        switch(item.state) {
            case '正常':
                stateClassName = 'normal';
                break;
            case '封号':
                stateClassName = 'fenghao';
                break;
            case '异常':
                stateClassName = 'warning';
                break;
            default:
                stateClassName = 'unknown';
                break;
        }
        item.stateClassName = stateClassName;
    });
}

