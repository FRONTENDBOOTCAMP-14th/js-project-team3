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
            process.env.VITE_NEXON_OPEN_API_KEY1 || process.env.NEXON_OPEN_API_KEY1,
            process.env.VITE_NEXON_OPEN_API_KEY2 || process.env.NEXON_OPEN_API_KEY2,
            process.env.VITE_NEXON_OPEN_API_KEY3 || process.env.NEXON_OPEN_API_KEY3,
            process.env.VITE_NEXON_OPEN_API_KEY4 || process.env.NEXON_OPEN_API_KEY4
        ];
        
        console.log(`[OUID] 환경변수 확인 - API Key 1: ${apiKeys[0] ? '설정됨' : '설정되지 않음'}`);
        console.log(`[OUID] 환경변수 확인 - API Key 2: ${apiKeys[1] ? '설정됨' : '설정되지 않음'}`);
        console.log(`[OUID] 환경변수 확인 - API Key 3: ${apiKeys[2] ? '설정됨' : '설정되지 않음'}`);
        console.log(`[OUID] 환경변수 확인 - API Key 4: ${apiKeys[3] ? '설정됨' : '설정되지 않음'}`);
        console.log(`[OUID] 사용 가능한 환경변수:`, Object.keys(process.env).filter(key => key.includes('NEXON')));
        
        const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        
        if (!selectedApiKey) {
            console.error(`[OUID] 모든 API 키가 설정되지 않음`);
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({
                    success: false,
                    error: "API keys not configured"
                })
            };
        }

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
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 