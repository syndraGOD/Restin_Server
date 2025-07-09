const Mixpanel = require('mixpanel');


module.exports = mixpanel = () => {
    try{
        var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);


        
        return mixpanel;
    }catch(error){
        console.error('Mixpanel 초기화 실패:', error);
    }
  };