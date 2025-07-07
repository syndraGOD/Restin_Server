


module.exports = sendDiscordWebhook = async (webhookUrl, username='', title='', message='') => {
    try {

        message += `\n\n수신 : ${global.timeStamp()}`
        const webhookData = {
            username,
            embeds: [
                {
                title,
                description: message,
                color: 0x0099ff,
                },
            ],
            timestamp: new Date().toISOString(),
        };
    
        // #데브 전용
        if(process.env.NODE_ENV !== "production") webhookUrl = process.env.DISCORD_DEV;

        console.log(webhookUrl);
        const response = await fetch(webhookUrl
            , {//await fetch(DISCORD_DEV_SMS, {
          method: 'POST', // 웹훅은 POST 요청 사용
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 전송 시 필수
          },
          body: JSON.stringify(webhookData), // JavaScript 객체를 JSON 문자열로 변환하여 전송
        });
    
        if (!response.ok) {
          console.error('Discord 웹훅 메시지 전송 실패:', response.status, response.statusText);
          const errorData = await response.text(); // 또는 response.json() 시도
          console.error('Discord API 응답 데이터:', errorData);
        }
    } catch (error) {
      console.error('디스코드 메시지 전송 에러 catch:', error);
    }
  };