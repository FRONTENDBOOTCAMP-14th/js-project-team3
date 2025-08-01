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
        const query = event.queryStringParameters?.query || "서든어택";
        const maxResults = event.queryStringParameters?.maxResults || 10;
        
        // 환경변수에서 YouTube API 키 가져오기
        const youtubeApiKey = process.env.VITE_YOUTUBE_OPEN_API_KEY || process.env.YOUTUBE_OPEN_API_KEY;

        console.log(`[YOUTUBE] 환경변수 확인 - API Key: ${youtubeApiKey ? '설정됨' : '설정되지 않음'}`);
        console.log(`[YOUTUBE] 사용 가능한 환경변수:`, Object.keys(process.env).filter(key => key.includes('YOUTUBE')));
        console.log(`[YOUTUBE] 전체 환경변수 키:`, Object.keys(process.env));

        if (!youtubeApiKey) {
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ 
                    success: false,
                    error: "YouTube API key not configured" 
                })
            };
        }

        // YouTube Search API 호출
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&eventType=live&key=${youtubeApiKey}&maxResults=${maxResults}`;
        
        console.log(`[YOUTUBE] Search API 호출: ${searchUrl}`);
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchResponse.ok) {
            console.error(`[YOUTUBE] Search API 오류: ${searchResponse.status} - ${JSON.stringify(searchData)}`);
            throw new Error(`YouTube Search API error: ${searchResponse.status}`);
        }

        const videoIds = searchData.items.map(item => item.id.videoId).filter(id => id);
        
        if (videoIds.length === 0) {
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    success: true,
                    data: []
                })
            };
        }

        // YouTube Videos API 호출
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
        
        console.log(`[YOUTUBE] Videos API 호출: ${videoDetailsUrl}`);
        
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        const videoDetailsData = await videoDetailsResponse.json();

        if (!videoDetailsResponse.ok) {
            console.error(`[YOUTUBE] Videos API 오류: ${videoDetailsResponse.status} - ${JSON.stringify(videoDetailsData)}`);
            throw new Error(`YouTube Videos API error: ${videoDetailsResponse.status}`);
        }

        // 채널 정보 가져오기
        const channelsToFetch = new Set();
        videoDetailsData.items.forEach(video => {
            channelsToFetch.add(video.snippet.channelId);
        });

        const channelIds = Array.from(channelsToFetch).filter(id => id);
        let channelDetails = {};
        
        if (channelIds.length > 0) {
            const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(",")}&key=${youtubeApiKey}`;
            
            console.log(`[YOUTUBE] Channels API 호출: ${channelDetailsUrl}`);
            
            const channelDetailsResponse = await fetch(channelDetailsUrl);
            const channelDetailsData = await channelDetailsResponse.json();

            if (channelDetailsResponse.ok) {
                channelDetailsData.items.forEach(channel => {
                    channelDetails[channel.id] = channel.snippet.thumbnails.default.url;
                });
            } else {
                console.warn(`[YOUTUBE] Channels API 오류: ${channelDetailsResponse.status} - ${JSON.stringify(channelDetailsData)}`);
            }
        }
        
        // 응답 데이터 구성
        const youtubeLives = videoDetailsData.items.map(video => ({
            platform: "youtube", 
            liveTitle: video.snippet.title,
            liveThumbnailImageUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
            channelId: video.snippet.channelId,
            channelName: video.snippet.channelTitle,
            channelImageUrl: channelDetails[video.snippet.channelId] || "https://via.placeholder.com/30", 
            concurrentUserCount: video.liveStreamingDetails?.concurrentViewers || 0, 
            liveStreamUrl: `https://www.youtube.com/watch?v=${video.id}`
        }));

        console.log(`[YOUTUBE] 라이브 목록 조회 성공: ${youtubeLives.length}개`);

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                data: youtubeLives
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