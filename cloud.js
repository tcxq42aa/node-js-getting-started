var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function (request, response) {
    response.success('Hello world!');
});

AV.Cloud.define('FUNCTION_receiversOffline', function (request, response) {
    var params = request.params;

    if (params.convId) {
        var profile_name = 'workstation_',
            profile_env = 'dev';
        var query = new AV.Query('_Conversation');
        query.equalTo('objectId', params.convId);
        query.find().then(function (results) {
            var json = {
                // 自增未读消息的数目，不想自增就设为数字
                badge: "Increment",
                sound: "default",
                // 使用开发证书
                _profile: profile_name + profile_env,
                // content 为消息的实际内容
                alert: JSON.stringify(params.content)
            };

            if (results && results.length > 0) {
                json.businessId = 2001;
                json.convId = params.convId;
                var pushMessage = JSON.stringify(json);

                try {
                    var attr = results[0].attributes.attr || {};
                    var message = JSON.parse(params.content);
                    var from = attr.userName || '';

                    if (message._lcattrs && message._lcattrs.dest == 'online') {
                        profile_name = 'online_';
                        from = attr.name || '';
                    }
                    try {
                        if (message._lcattrs && message._lcattrs.profile) {
                            profile_env = message._lcattrs.profile;
                        }
                    } catch (e) {
                    }
                    json._profile = profile_name + profile_env;

                    if (message._lctype == -1) {
                        if (message._lcattrs && message._lcattrs.houseCard) {
                            json.alert = from + ': ' + (message._lctext || '[房源卡片]');
                        } else {
                            json.alert = from + ': ' + message._lctext;
                        }
                        pushMessage = JSON.stringify(json);
                    } else if ((message._lctype == -2)) {
                        json.alert = from + ': ' + (message._lctext || '[图片]');
                        pushMessage = JSON.stringify(json);
                    }
                } catch (e) {
                } finally {
                    response.success({"pushMessage": pushMessage});
                }

            } else {
                response.success({"pushMessage": params.content});
            }
        });
    } else {
        response.success({"pushMessage": params.content});
    }
});


module.exports = AV.Cloud;
