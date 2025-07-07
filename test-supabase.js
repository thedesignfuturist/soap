const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ydnhwgewjcrrtokhdmnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkbmh3Z2V3amNycnRva2hkbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEzNzcsImV4cCI6MjA2NzQ0NzM3N30.uxGf6yIu6_xMMbyrvG2BoF_i6rFEDSI1513ekxx1wt8';

const supabase = createClient(supabaseUrl, supabaseKey);

const newsletters = [
  {
    title: "AI 트렌드 2024 상반기 총정리",
    tag: "AI",
    author: "Jane Doe",
    thumbnail: "/next.svg",
    content: "<p>AI는 2024년 상반기에도 빠르게 발전하고 있습니다. 생성형 AI, 멀티모달 AI, 오픈소스 AI 등 다양한 트렌드가 등장하고 있으며, 기업과 개발자 모두 새로운 기회를 모색하고 있습니다.</p>",
    date: "2024-07-07"
  },
  {
    title: "디자인 시스템 구축 실전 가이드",
    tag: "Design",
    author: "John Smith",
    thumbnail: "/vercel.svg",
    content: "<p>디자인 시스템은 일관된 UI/UX를 제공하고 개발 생산성을 높여줍니다. 실무에서 바로 적용할 수 있는 디자인 시스템 구축 노하우를 소개합니다.</p>",
    date: "2024-07-01"
  },
  {
    title: "프론트엔드 개발 생산성 꿀팁",
    tag: "Frontend",
    author: "Alex Kim",
    thumbnail: "/globe.svg",
    content: "<p>생산성 높은 프론트엔드 개발을 위해서는 도구 자동화, 코드 스플리팅, 컴포넌트 재사용 등 다양한 전략이 필요합니다. 실전 팁을 모아 소개합니다.</p>",
    date: "2024-06-28"
  }
];

(async () => {
  const { data, error } = await supabase.from('newsletter').insert(newsletters);
  if (error) {
    console.error('삽입 에러:', error);
  } else {
    console.log('삽입 성공:', data);
  }
})();