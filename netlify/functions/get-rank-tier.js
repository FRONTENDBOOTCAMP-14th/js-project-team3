exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    let ouid;
    
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      ouid = body.ouid;
    } else {
      // GET 요청의 경우 쿼리 파라미터에서 ouid 가져오기
      ouid = event.queryStringParameters?.ouid;
    }
    
    if (!ouid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "OUID is required" })
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

    // 서든어택 API로 랭크 티어 조회
    const response = await fetch(`https://open.api.nexon.com/suddenattack/v1/user/rank-tier?ouid=${ouid}`, {
      method: "GET",
      headers: {
        "x-nxopen-api-key": selectedApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.user_name) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            user_name: data.user_name,
            user_level: data.user_level,
            clan_name: data.clan_name,
            clan_mark: data.clan_mark,
            user_date_create: data.user_date_create,
            user_date_last_login: data.user_date_last_login,
            rank_tier: data.rank_tier || {}
          }
        })
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Rank tier not found"
        })
      };
    }

  } catch (error) {
    console.error("Error:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error"
      })
    };
  }
}; 