exports.handler = async function(event, context) {
    // CORS 헤더 설정
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Client-Id, Client-Secret",
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

    // GET 요청만 허용
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        // 파라미터 추출
        const size = event.queryStringParameters?.size || 20;
        const next = event.queryStringParameters?.next;
        
        // 클라이언트 ID와 시크릿 추출
        const clientId = event.headers["client-id"];
        const clientSecret = event.headers["client-secret"];

        if (!clientId || !clientSecret) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ 
                    success: false,
                    error: "Client-Id and Client-Secret headers are required" 
                })
            };
        }

        // 치지직 API 호출
        let url = `https://api.chzzk.naver.com/service/v1/lives?size=${size}`;
        if (next) {
            url += `&next=${next}`;
        }

        console.log(`[CHZZK] API 호출: ${url}`);
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Client-Id": clientId,
                "Client-Secret": clientSecret,
                "Content-Type": "application/json"
            }
        });

        console.log(`[CHZZK] 응답 상태: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CHZZK] API 오류: ${response.status} - ${errorText}`);
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