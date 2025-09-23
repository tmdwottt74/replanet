import React, { useState, useEffect } from 'react';

const SocialFeed: React.FC = () => {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/social/feed');
        const data = await response.json();
        setFeed(data);
      } catch (error) {
        console.error('Error fetching social feed:', error);
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 5000); // 5초마다 데이터 다시 가져오기

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="social-feed">
      <h3>소셜 피드</h3>
      <ul>
        {feed.map((item, index) => (
          <li key={index}>
            <span className="username">{item.user.username}</span>
            <span className="content">{item.content}</span>
            <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocialFeed;
