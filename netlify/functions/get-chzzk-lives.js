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
        
        // 환경변수에서 클라이언트 ID와 시크릿 가져오기
        const clientId = process.env.VITE_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID;
        const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET;

        console.log(`[CHZZK] 환경변수 확인 - ClientId: ${clientId ? '설정됨' : '설정되지 않음'}, ClientSecret: ${clientSecret ? '설정됨' : '설정되지 않음'}`);
        console.log(`[CHZZK] 사용 가능한 환경변수:`, Object.keys(process.env).filter(key => key.includes('NAVER')));
        console.log(`[CHZZK] 전체 환경변수 키:`, Object.keys(process.env));

        if (!clientId || !clientSecret) {
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ 
                    success: false,
                    error: "API credentials not configured" 
                })
            };
        }

        // 치지직 API 호출
        let url = `https://api.chzzk.naver.com/service/v1/lives?size=${size}`;
        if (next) {
            url += `&next=${next}`;
        }

        console.log(`[CHZZK] API 호출: ${url}`);
        
        // AbortController를 사용한 타임아웃 설정 (5초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Client-Id": clientId,
                    "Client-Secret": clientSecret,
                    "Content-Type": "application/json"
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`[CHZZK] 응답 상태: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[CHZZK] API 오류: ${response.status} - ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log(`[CHZZK] API 응답 구조:`, JSON.stringify(data, null, 2));
            console.log(`[CHZZK] API 응답 키:`, Object.keys(data));

            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    success: true,
                    data: data
                })
            };
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error(`[CHZZK] API 타임아웃 (5초 초과)`);
                return {
                    statusCode: 408,
                    headers: headers,
                    body: JSON.stringify({
                        success: false,
                        error: "API request timeout"
                    })
                };
            }
            
            throw fetchError;
        }

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