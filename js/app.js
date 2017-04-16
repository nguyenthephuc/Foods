var app = angular.module('app', ['ngDialog']);

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
app.controller('indexController', function ($scope, $http, $interval, $timeout, ngDialog) {

    $scope.to_slug = function(str) {
        if(str === undefined) return;
        str = str.toString().toLowerCase();
        str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
        str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
        str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
        str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
        str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
        str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
        str = str.replace(/(đ)/g, 'd');
        str = str.replace(/([^0-9a-z-\s])/g, '');
        str = str.replace(/(\s+)/g, '-');
        str = str.replace(/^-+/g, '');
        str = str.replace(/-+$/g, '');
        return str;
    };
    let interval;
    $scope.getDetail = function(alias) {
        let options = {
            method: 'GET',
            url: alias,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        };
        $http(options).then(function(res) {
            let seconds = res.data.countdown;
            interval = $interval(function() {
                let days = Math.floor(seconds / 24 / 60 / 60);
                let hoursLeft = Math.floor((seconds) - (days * 86400));
                let hours = Math.floor(hoursLeft / 3600);
                let minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
                let minutes = Math.floor(minutesLeft / 60);
                let remainingSeconds = seconds % 60;
                if (remainingSeconds < 10)
                    remainingSeconds = "0" + remainingSeconds;
                $scope.countdown_time = days + " ngày : " + hours + " giờ : " + minutes + " phút : " + remainingSeconds + ' giây';
                seconds--;
            }, 1000);
            $scope.detail = res.data;
        });
    };

    let reset = function() {
        $scope.is_end_page = false;
        $scope.page = 0;
        $scope.foods = [];
        $scope.getFoods('/'+$scope.page+'_ofs');
    };

    $scope.foods = [];
    $scope.is_end_page = false;
    $scope.province = 'ho-chi-minh';

    $scope.changeProvince = function(province) {
        $scope.province = province;
        reset();
        ngDialog.close();
    };

    $scope.getFoods = function(num = '') {
        let options = {
            method: 'GET',
            url: 'https://www.meete.co/' + $scope.province + num,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }
        $http(options).then(function(res) {
            $scope.foods = $scope.foods.concat(res.data.data);
            if(res.data.data.length <= 0)
                $scope.is_end_page = true;
        });
    };

    $scope.viewDetail = function(slug, title, id) {
        let alias = 'https://www.meete.co/'+slug+'/khuyen-mai-'+$scope.to_slug(title)+'-'+id;
        $scope.getDetail(alias);
        ngDialog.open({
            template: 'externalTemplate.html',
            width: '50%',
            showClose: false,
            scope: $scope
        });
    };

    $scope.page = 0;
    $scope.getFoods('/'+$scope.page+'_ofs');

    let showAbout = function() {
        ngDialog.open({
            template: 'about.html',
            width: '30%',
            showClose: false
        });
        $timeout(function() {
            let content = document.body.querySelector('div.ngdialog-content');
            content.classList.add('about_me');
        }, 100);
    };

    let showChangeProvince = function() {
        ngDialog.open({
            template: 'changeProvince.html',
            width: '30%',
            showClose: false,
            scope: $scope
        });
    };

    $scope.is_show_find = 'close';
    $scope.is_show_result = 'close';
    $scope.contextMenuAction = function(action) {
        switch(action) {
            case 'province':
                showChangeProvince();
                break;
            case 'refresh':
                reset();
                break;
            case 'exit':
                window.close();
                break;
            case 'about':
                if($scope.is_show_find === 'close')
                    showAbout();
                break;
            case 'find':
                ngDialog.close();
                $scope.is_show_find = 'open';
                window['fb_quick_share_ext-spotlight'].focus();
                break;
        }
    };

    let clearSearchResult = function() {
        window['fb_quick_share_ext-autofill_result'].innerHTML = '';
    };

    $scope.autoComplete = function() {
        let keyword = $scope.to_slug($scope.keyword.toLowerCase());
        if(!keyword) {
            $scope.is_show_result = 'close';
            return;
        }
        clearSearchResult();
        angular.forEach($scope.foods, function(value, key){
            let _address = $scope.to_slug(value.address.toLowerCase());
            let _name    = $scope.to_slug(value.name.toLowerCase());
            let _title   = $scope.to_slug(value.title.toLowerCase());
            if(_address.includes(keyword) || _name.includes(keyword) || _title.includes(keyword)) {
                $scope.is_show_result = 'open';
                let __li = window.document.createElement('li');
                    __li.setAttribute('post-id', value.id);
                    __li.setAttribute('slug', value.slug);
                    __li.setAttribute('title', value.title);
                    __li.setAttribute('address', value.address);
                let __im = window.document.createElement('img');
                    __im.src = 'https://media.meete.co/cache/50x50/' + value.avatar;
                    __im.alt = value.title;
                let __ti = window.document.createElement('span');
                    __ti.innerHTML = value.name;
                    __ti.style.fontWeight = 'bold';
                let __sp = window.document.createElement('span');
                    __sp.innerHTML = "<br /><br /><i class='glyphicon glyphicon-star'></i> " + value.title +
                                        "<br /><i class='glyphicon glyphicon-map-marker'></i> <small>" + value.address + "</small>";
                __li.appendChild(__im);
                __li.appendChild(__ti);
                __li.appendChild(__sp);
                __li.onclick = function() {
                    let id = this.getAttribute('post-id');
                    let slug = this.getAttribute('slug');
                    let title = this.getAttribute('title');
                    $scope.is_show_find = 'close';
                    $scope.viewDetail(slug, title, id);
                };
                window['fb_quick_share_ext-autofill_result'].appendChild(__li);
            }
        });
    };

    window.onscroll = function(ev) {
        $('#equalize').equalHeights();
        if($scope.is_end_page) return;
        let cur = Math.floor(window.innerHeight + window.scrollY) + 2;
        if (cur >= document.body.offsetHeight) {
            $scope.page += 20;
            $scope.getFoods('/'+$scope.page+'_ofs');
        }
    };

    let contextMenu = window['contextMenu'];
    window.onclick = function() {
        contextMenu.style.display = 'none';
    };

    window.onkeydown = function(event) {
        let keyCode = event.which || event.keyCode;
        // Esc
        if(keyCode === 27) {
            clearSearchResult();
            contextMenu.style.display = 'none';
            $scope.is_show_find = 'close';
            $scope.keyword = '';
            $scope.$apply();
        }
        // Ctrl + R
        if(event.ctrlKey && keyCode === 82) {
            reset();
            $scope.$apply();
        }
        // Ctrl + Q
        if(event.ctrlKey && keyCode === 81) window.close();
        // Ctrl + H
        if(event.ctrlKey && keyCode === 72) showChangeProvince();
        // Ctrl + B
        if(event.ctrlKey && keyCode === 66 && $scope.is_show_find === 'close') showAbout();
        // Ctrl + F
        if(event.ctrlKey && keyCode === 70) {
            ngDialog.close();
            $scope.is_show_find = 'open';
            $scope.$apply();
            window['fb_quick_share_ext-spotlight'].focus();
        }
    };

    document.body.addEventListener('contextmenu', function(event) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    });
});