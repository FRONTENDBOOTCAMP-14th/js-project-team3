exports.handler = async function(event, context) {
    // CORS 헤더 설정
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    // OPTIONS 요청 처리
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: headers,
            body: ""
        };
    }

    // GET 또는 POST 요청만 허용
    if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        // 파라미터 추출
        let nickname;
        if (event.httpMethod === "POST") {
            const body = JSON.parse(event.body);
            nickname = body.nickname;
        } else {
            nickname = event.queryStringParameters?.nickname;
        }

        if (!nickname) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: "nickname parameter is required" })
            };
        }

        // API 키 로테이션
        const apiKeys = [
            process.env.NEXON_OPEN_API_KEY1,
            process.env.NEXON_OPEN_API_KEY2,
            process.env.NEXON_OPEN_API_KEY3,
            process.env.NEXON_OPEN_API_KEY4
        ];
        const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

        // 서든어택 API 호출
            const url = `https://open.api.nexon.com/suddenattack/v1/id?user_name=${encodeURIComponent(nickname)}`;
    console.log(`[OUID] API 호출: ${url}`);
    
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "x-nxopen-api-key": selectedApiKey
        }
    });

    console.log(`[OUID] 응답 상태: ${response.status}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OUID] API 오류: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                data: {
                    ouid: data.ouid,
                    nickname: nickname
                }
            })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}; 