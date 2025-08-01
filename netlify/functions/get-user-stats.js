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
        let ouid;
        if (event.httpMethod === "POST") {
            const body = JSON.parse(event.body);
            ouid = body.ouid;
        } else {
            ouid = event.queryStringParameters?.ouid;
        }

        if (!ouid) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: "ouid parameter is required" })
            };
        }

        // API 키 로테이션
        const apiKeys = [
            process.env.VITE_NEXON_OPEN_API_KEY1 || process.env.NEXON_OPEN_API_KEY1,
            process.env.VITE_NEXON_OPEN_API_KEY2 || process.env.NEXON_OPEN_API_KEY2,
            process.env.VITE_NEXON_OPEN_API_KEY3 || process.env.NEXON_OPEN_API_KEY3,
            process.env.VITE_NEXON_OPEN_API_KEY4 || process.env.NEXON_OPEN_API_KEY4
        ];
        const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

        // 서든어택 API 호출 (기본 정보만 사용)
        const response = await fetch(`https://open.api.nexon.com/suddenattack/v1/user/basic?ouid=${ouid}`, {
            method: "GET",
            headers: {
                "x-nxopen-api-key": selectedApiKey
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                data: data
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