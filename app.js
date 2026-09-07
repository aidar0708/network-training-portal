const articles=[
  {layer:'L1',title:'Потери пакетов и ошибки CRC',text:'Чек-лист проверки оптики, SFP-модуля, уровня сигнала и ошибок на интерфейсе.',meta:'Обновлено сегодня · 6 мин'},
  {layer:'L1',title:'Интерфейс down: первичная проверка',text:'Как отличить отсутствие линка от административного shutdown и аварии CPE.',meta:'Чек-лист · 4 мин'},
  {layer:'L2',title:'VLAN не проходит через транк',text:'Проверка allowed VLAN, native VLAN, tagging и MAC-таблицы по обеим сторонам.',meta:'Инструкция · 8 мин'},
  {layer:'L2',title:'Петля в сети и срабатывание STP',text:'Симптомы, безопасная локализация и порядок восстановления сервиса.',meta:'Разбор · 7 мин'},
  {layer:'L3',title:'BGP соседство: Idle / Active',text:'Последовательность проверки reachability, ASN, TCP/179 и политики маршрутизации.',meta:'Инструкция · 10 мин'},
  {layer:'L3',title:'Нет маршрута до подсети клиента',text:'Диагностика RIB/FIB, next-hop и анонсов в OSPF и BGP.',meta:'Чек-лист · 6 мин'},
  {layer:'Процесс',title:'Правила эскалации в NOC',text:'Когда собрать данные самостоятельно, а когда передать инцидент в транспорт или ядро.',meta:'Регламент · 5 мин'},
  {layer:'Процесс',title:'Шаблон коммуникации с клиентом',text:'Статусные сообщения при диагностике, деградации и восстановлении канала.',meta:'Шаблон · 3 мин'}
];
const courses=[
  ['complete','01','Ориентация в провайдерской сети','Карта национального оператора: доступ, агрегация, MPLS-ядро и внешние стыки','Открыть обзор'],
  ['complete','02','Физический уровень L1','Оптика, Ethernet, измерения и счётчики ошибок','Открыть обзор'],
  ['current','03','Диагностика проблем L2','VLAN, STP, MAC-таблицы и агрегация каналов','Продолжить'],
  ['','04','Маршрутизация и L3','IP, BGP, OSPF, MTU и поиск маршрута','Начать'],
  ['locked','05','Ведение инцидента','Коммуникация, эскалация и постмортем','Откроется позже']
];
const grid=document.getElementById('article-grid'),template=document.getElementById('article-template');
function renderArticles(query='',filter='all'){
  const needle=query.trim().toLowerCase();
  const result=articles.filter(a=>(filter==='all'||a.layer===filter)&&((a.title+' '+a.text+' '+a.layer).toLowerCase().includes(needle)));
  grid.innerHTML='';
  result.forEach(a=>{
    const n=template.content.cloneNode(true);
    n.querySelector('.tag').textContent=a.layer;
    n.querySelector('h2').textContent=a.title;
    n.querySelector('p').textContent=a.text;
    n.querySelector('.article-footer span').textContent=a.meta;
    n.querySelector('.bookmark').onclick=e=>{e.currentTarget.classList.toggle('saved');e.currentTarget.textContent=e.currentTarget.classList.contains('saved')?'★':'☆'};
    grid.append(n);
  });
  document.getElementById('search-note').textContent=needle?'Найдено материалов: '+result.length:'';
}
function renderCourses(){
  const levelByCourse={02:'l1',03:'l2',04:'l3'};
  document.getElementById('learning-path').innerHTML=courses.map(c=>'<article class="course '+c[0]+'"><span class="course-num">'+(c[0]==='complete'?'✓':c[1])+'</span><div><h2>'+c[2]+'</h2><p>'+c[3]+'</p></div><button '+(c[0]==='locked'?'disabled':'')+(c[1]==='01'?' data-open-orientation':'')+(levelByCourse[c[1]]?' data-open-level="'+levelByCourse[c[1]]+'"':'')+'>'+c[4]+' →</button></article>').join('');
  const orientationButton=document.querySelector('[data-open-orientation]');
  if(orientationButton)orientationButton.onclick=()=>{
    const guide=document.getElementById('network-orientation');
    document.querySelectorAll('.course').forEach(course=>course.classList.remove('active-course'));
    orientationButton.closest('.course').classList.add('active-course');
    guide.scrollIntoView({behavior:'smooth',block:'start'});guide.focus({preventScroll:true});
  };
  document.querySelectorAll('[data-open-level]').forEach(button=>button.onclick=()=>openLevel(button.dataset.openLevel));
}
function openLevel(level){
  showView('academy');
  const section=document.getElementById('level-guide'),target=document.getElementById('level-'+level);
  document.querySelectorAll('.level-detail').forEach(item=>item.classList.toggle('active-level',item===target));
  section.scrollIntoView({behavior:'smooth',block:'start'});
  target.focus({preventScroll:true});
}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('visible',v.id===id));
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-view]').forEach(a=>a.onclick=e=>{e.preventDefault();showView(a.dataset.view)});
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>showView(b.dataset.go));
let currentFilter='all';
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{
  document.querySelector('.filter.active').classList.remove('active');
  b.classList.add('active');currentFilter=b.dataset.filter;
  renderArticles(document.getElementById('knowledge-search').value,currentFilter);
});
document.getElementById('knowledge-search').oninput=e=>renderArticles(e.target.value,currentFilter);
document.getElementById('global-search').onkeydown=e=>{
  if(e.key==='Enter'){showView('knowledge');document.getElementById('knowledge-search').value=e.target.value;renderArticles(e.target.value,currentFilter);}
};
document.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>{
  showView('knowledge');const q=b.dataset.search;
  document.getElementById('knowledge-search').value=q;renderArticles(q,currentFilter);
});
document.querySelectorAll('.quick-card[data-open-level]').forEach(button=>button.onclick=()=>openLevel(button.dataset.openLevel));
let score=0;
const log=document.getElementById('scenario-log');
const answers={
  ping:'Потери подтверждены: 12–18%, задержка нестабильна. Это подтверждает деградацию, но пока не локализует её.',
  interface:'На xe-0/0/12 растут CRC errors и input errors. Вероятный источник — физический уровень L1. Следующий шаг: проверить оптические показатели и патч-корд.',
  vlan:'Рано менять конфигурацию: это может усугубить инцидент. Сначала соберите факты с интерфейса.',
  escalate:'Эскалация потребуется, но сначала необходимо зафиксировать первичные признаки и локализовать уровень.'
};
document.getElementById('actions').onclick=e=>{
  if(e.target.tagName!=='BUTTON'||e.target.disabled)return;
  const key=e.target.dataset.action;
  log.innerHTML='<p><b>'+(key==='interface'?'✓ Хорошее действие. ':'')+'</b>'+answers[key]+'</p>';
  if(key==='interface'){score=3;document.querySelectorAll('#actions button').forEach(b=>b.disabled=true);}
  else if(key==='ping'&&score===0){score=1;e.target.disabled=true;}
  else e.target.disabled=true;
  document.getElementById('scenario-progress').style.width=(score/3*100)+'%';
  document.getElementById('scenario-score').textContent=score+' из 3 диагностических шагов';
};
const quizzes={
  mpls:{category:'ТЕСТ · MPLS И L3VPN',title:'Базовая архитектура MPLS',questions:[
    {q:'Какова основная роль P-роутера в MPLS-ядре?',a:['Хранить маршруты всех клиентских VRF','Пересылать пакеты по транспортной MPLS-метке','Назначать VPN-метку на входе клиента','Терминировать BGP-сессию CE'],ok:1},
    {q:'На каком устройстве определяется VRF клиента и добавляется VPN-метка?',a:['CE','P','PE','LDP-сервер'],ok:2},
    {q:'Что сначала следует проверить при потере пакетов в MPLS L3VPN?',a:['Сменить route-target','Проверить линк и счётчики CE–PE','Удалить BGP-соседство','Перезагрузить PE'],ok:1}
  ]},
  l2:{category:'ТЕСТ · ДИАГНОСТИКА L2',title:'Канальный уровень',questions:[
    {q:'Что проверить первым при жалобе «VLAN не проходит через транк»?',a:['Список разрешённых VLAN на транке','Таблицу BGP','LDP-сессию','DNS клиента'],ok:0},
    {q:'Какой признак часто указывает на физическую проблему, а не на VLAN?',a:['Рост CRC errors на интерфейсе','Отсутствие MAC-адреса в VLAN','Разные native VLAN','STP blocking'],ok:0},
    {q:'Что делает STP при обнаружении петли?',a:['Добавляет MPLS-метку','Блокирует избыточный порт','Перезапускает BGP','Меняет IP-адрес'],ok:1}
  ]}
};
let activeQuiz='mpls',questionIndex=0,selectedAnswer=null,correctAnswers=0;
function renderQuestion(){
  const quiz=quizzes[activeQuiz],item=quiz.questions[questionIndex],area=document.getElementById('question-area');
  document.getElementById('test-category').textContent=quiz.category;
  document.getElementById('test-title').textContent=quiz.title;
  document.getElementById('test-count').textContent='Вопрос '+(questionIndex+1)+' из '+quiz.questions.length;
  document.querySelector('#test-progress i').style.width=((questionIndex+1)/quiz.questions.length*100)+'%';
  area.innerHTML='';
  const prompt=document.createElement('p');prompt.className='question';prompt.textContent=item.q;area.append(prompt);
  const answers=document.createElement('div');answers.className='answers';
  item.a.forEach((answer,index)=>{
    const label=document.createElement('label');label.className='answer';
    const input=document.createElement('input');input.type='radio';input.name='quiz-answer';input.value=index;
    input.onchange=()=>{selectedAnswer=index;document.getElementById('next-question').disabled=false;};
    const text=document.createElement('span');text.textContent=answer;label.append(input,text);answers.append(label);
  });
  area.append(answers);selectedAnswer=null;
  const next=document.getElementById('next-question');next.disabled=true;next.innerHTML=(questionIndex===quiz.questions.length-1?'Завершить тест':'Ответить')+' <span>→</span>';
}
function showResult(){
  const quiz=quizzes[activeQuiz],percent=Math.round(correctAnswers/quiz.questions.length*100),passed=percent>=80,area=document.getElementById('question-area');
  area.innerHTML='<div class="result"><span class="tag '+(passed?'':'red')+'">'+(passed?'ТЕСТ ПРОЙДЕН':'ТРЕБУЕТСЯ ПОВТОРЕНИЕ')+'</span><div class="result-score">'+percent+'%</div><h2>'+(passed?'Отличная работа!':'Попробуйте ещё раз')+'</h2><p>'+(passed?'Вы подтвердили базовое понимание материала. Результат можно использовать для допуска к следующему модулю.':'Перед повторной попыткой вернитесь к модулю и разберите отмеченные темы.')+'</p></div>';
  document.getElementById('test-count').textContent=correctAnswers+' правильных из '+quiz.questions.length;
  document.querySelector('#test-progress i').style.width='100%';
  document.getElementById('next-question').disabled=true;
}
document.getElementById('next-question').onclick=()=>{
  const quiz=quizzes[activeQuiz],item=quiz.questions[questionIndex];
  if(selectedAnswer===item.ok)correctAnswers++;
  questionIndex++;
  if(questionIndex<quiz.questions.length)renderQuestion();else showResult();
};
document.getElementById('restart-test').onclick=()=>{questionIndex=0;correctAnswers=0;renderQuestion();};
document.querySelectorAll('[data-test]').forEach(button=>button.onclick=()=>{
  document.querySelector('.test-select.active').classList.remove('active');button.classList.add('active');
  activeQuiz=button.dataset.test;questionIndex=0;correctAnswers=0;renderQuestion();
});
renderArticles();renderCourses();renderQuestion();
