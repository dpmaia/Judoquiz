import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { categoryNames, type Category, type Grade, type QuizConfig, type Question, type Response, type Result } from './domain';
import { grades, media, questions, requirements } from './content';
import { categoryBreakdown, eligible, loadResults, prepare, saveResult, score } from './quiz';
import { studyMedia } from './studyMedia';
import { ActionLink, Belt, GradeMark, Icon, TextLink, studyAsset } from './ui';
import VideoPlayer from './VideoPlayer';

const categories = Object.keys(categoryNames) as Category[];
const modeName = {simulado: 'Simulado', treino: 'Treino livre'};
const sessionPath = (config: QuizConfig) => config.mode === 'treino' ? '/treino' : '/simulado/' + config.gradeId;
const plural = (count: number, one: string, many: string) => count + ' ' + (count === 1 ? one : many);
const preview = questions.find(question => question.id === 'bc-rei-1')!;

function Layout({children}: {children: ReactNode}) {
  const {pathname, search, state} = useLocation();
  const main = useRef<HTMLElement>(null);
  const previous = useRef('');
  const route = pathname.startsWith('/resultado/') ? pathname + search : pathname;
  const quiz = pathname === '/quiz';
  const config = quiz ? state as QuizConfig | undefined : undefined;
  const simulation = pathname === '/faixas' || pathname.startsWith('/simulado/') || (pathname.startsWith('/resultado/') && state?.config?.mode !== 'treino');
  const training = pathname === '/treino' || (pathname.startsWith('/resultado/') && state?.config?.mode === 'treino');

  useEffect(() => {
    if (previous.current && previous.current !== route) {
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      main.current?.querySelector<HTMLElement>('h1')?.focus({preventScroll: true});
    }
    previous.current = route;
  }, [route]);

  return <>
    <a className="skip-link" href="#conteudo" onClick={event => {
      event.preventDefault();
      main.current?.focus();
    }}>Ir para o conteúdo</a>
    <header className={'topbar' + (quiz ? ' session-header' : '')}>
      <div className="wrap topbar-inner">
        {quiz ? <>
          <TextLink to={config?.mode === 'treino' ? '/treino' : '/faixas'} back>Sair</TextLink>
          <strong>{config ? modeName[config.mode] : 'Estudo'}</strong>
        </> : <>
          <Link className="brand" to="/" aria-label="Judô Quiz, início">
            <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>Judô Quiz
          </Link>
          <NavLink className="mobile-requirements" to="/requisitos"><Icon name="book" size={17}/>Requisitos</NavLink>
          <nav className={'nav' + (pathname === '/' ? ' nav-home' : '')} aria-label="Navegação principal">
            <Link to="/faixas" aria-current={simulation ? 'page' : undefined}>Simulado</Link>
            <Link to="/treino" aria-current={training ? 'page' : undefined}>Treino livre</Link>
            <NavLink className="nav-requirements" to="/requisitos">Requisitos</NavLink>
          </nav>
        </>}
      </div>
    </header>
    <main id="conteudo" tabIndex={-1} ref={main}>{children}</main>
    <footer><div className="wrap">Projeto independente. O Judô Quiz não representa um exame oficial da FMJ.</div></footer>
  </>;
}

function Home() {
  return <>
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-layout">
          <div className="hero-copy">
            <h1 tabIndex={-1}>Estude para a sua faixa de judô</h1>
            <p>Pratique teoria e reconhecimento de técnicas. Veja onde você errou e o que revisar.</p>
            <p className="hero-facts">{grades.length} faixas / {questions.length} questões</p>
            <div className="actions">
              <ActionLink to="/faixas" className="highlight">Escolher faixa</ActionLink>
              <ActionLink to="/treino" className="secondary hero-train">Abrir treino livre</ActionLink>
            </div>
          </div>
          <div className="quiz-preview">
            <div className="preview-top"><GradeMark grade={grades[0]}/><span className="badge">Prévia</span></div>
            <div className="preview-body">
              <p>{preview.prompt}</p>
              <div className="preview-media"><img src={studyAsset(preview.imagePath!)} alt="Sequência ilustrada de uma saudação do judô" width={222} height={188}/></div>
              <div className="preview-options"><span>A · {preview.options[1]}</span><span>B · {preview.options[0]}</span></div>
            </div>
          </div>
        </div>
        <div className="hero-links">
          <div className="hero-mobile-train"><TextLink to="/treino">Abrir treino livre</TextLink></div>
          <TextLink to="/requisitos">Consultar requisitos</TextLink>
          <span>Da branca/cinza à marrom</span>
        </div>
      </div>
    </section>
    <section className="wrap graduation-preview">
      <div className="section-head"><h2>Graduações</h2><TextLink to="/faixas">Ver todas as faixas</TextLink></div>
      <ul>{grades.map(grade => <li key={grade.id}>
        <Link to={'/simulado/' + grade.id}><Belt colors={grade.colors}/><span>{grade.name}</span></Link>
      </li>)}</ul>
    </section>
  </>;
}

function PageIntro({title, children}: {title: string; children?: ReactNode}) {
  return <div className="page-intro"><h1 tabIndex={-1}>{title}</h1>{children && <p>{children}</p>}</div>;
}

function GradeSelection() {
  return <section className="wrap page">
    <PageIntro title="Escolha a faixa">A graduação escolhida orienta as questões do simulado.</PageIntro>
    <div className="section-head"><span className="data-label">Do 11º ao 1º Kyû</span><TextLink to="/requisitos">Consultar requisitos</TextLink></div>
    <ul className="grade-grid">{grades.map(grade => <li key={grade.id}>
      <Link to={'/simulado/' + grade.id}>
        <Belt colors={grade.colors}/>
        <span><strong>{grade.name}</strong><small>{grade.kyu}º Kyû</small></span>
        <Icon name="arrow"/>
      </Link>
    </li>)}</ul>
  </section>;
}

function GradeSelect({grade, onChange, id}: {grade: Grade; onChange: (id: string) => void; id: string}) {
  return <div className="grade-select">
    <Belt colors={grade.colors}/>
    <select id={id} value={grade.id} onChange={event => onChange(event.target.value)}>
      {grades.map(option => <option value={option.id} key={option.id}>{option.name} · {option.kyu}º Kyû</option>)}
    </select>
    <Icon name="down"/>
  </div>;
}

function Catalog() {
  const [params, setParams] = useSearchParams();
  const grade = grades.find(item => item.id === params.get('faixa')) ?? grades[0];
  const gradeLink = (id: string) => '/requisitos?faixa=' + id;
  return <section className="wrap page">
    <PageIntro title="Requisitos por faixa">Consulte o programa de graduação descrito no art. 8º do regulamento da FMJ.</PageIntro>
    <div className="catalog-layout">
      <div className="catalog-select">
        <label className="field-title" htmlFor="catalog-grade">Faixa consultada</label>
        <GradeSelect grade={grade} id="catalog-grade" onChange={id => setParams({faixa: id})}/>
      </div>
      <nav className="catalog-nav" aria-label="Faixa consultada">
        <h2>Faixa consultada</h2>
        {grades.map(item => <Link to={gradeLink(item.id)} key={item.id} aria-current={item.id === grade.id ? 'page' : undefined}>
          <GradeMark grade={item}/><small>{item.kyu}º Kyû</small>
        </Link>)}
      </nav>
      <div className="catalog-detail">
        <h2>{grade.name}</h2>
        <p className="muted">{grade.kyu}º Kyû · FMJ, art. 8º, p. {grade.page}</p>
        <RequirementList grade={grade}/>
        <p className="hint">O programa é cumulativo e inclui as faixas anteriores, quando houver.</p>
        {grade.order > 0 && <details className="earlier-requirements">
          <summary>Consultar requisitos das faixas anteriores</summary>
          {grades.slice(0, grade.order).map(earlier => <section key={earlier.id}>
            <h3><GradeMark grade={earlier}/></h3><RequirementList grade={earlier}/>
          </section>)}
        </details>}
        <ActionLink to={'/simulado/' + grade.id}>Configurar simulado</ActionLink>
      </div>
    </div>
  </section>;
}

function RequirementList({grade}: {grade: Grade}) {
  return <dl className="requirement-list">{requirements.filter(item => item.gradeId === grade.id).map(item =>
    <div key={item.id}><dt>{categoryNames[item.category]}</dt><dd>{item.description}</dd></div>)}</dl>;
}

function ConfigPage({training = false}: {training?: boolean}) {
  const {gradeId} = useParams();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(gradeId ?? grades[0].id);
  const [count, setCount] = useState<10 | 20>(10);
  const [cumulative, setCumulative] = useState(true);
  const [selected, setSelected] = useState<Category[]>([]);
  const grade = grades.find(item => item.id === chosen) ?? grades[0];
  const config: QuizConfig = {gradeId: grade.id, count, cumulative, categories: selected, mode: training ? 'treino' : 'simulado'};
  const available = eligible(config).length;
  const short = available < count;
  const label = training ? 'Iniciar treino' : 'Iniciar simulado';
  function toggle(category: Category) {
    setSelected(items => items.includes(category) ? items.filter(item => item !== category) : [...items, category]);
  }

  return <section className="wrap page config-page">
    {!training && <TextLink to="/faixas" back>Voltar às faixas</TextLink>}
    <PageIntro title={training ? 'Treino livre' : 'Configure o simulado'}>
      {training ? 'Pratique por tema com feedback imediato. O treino pode incluir técnicas complementares.' : 'Escolha o conteúdo e a duração da rodada.'}
    </PageIntro>
    <form className="config-layout" onSubmit={event => {
      event.preventDefault();
      if (available) navigate('/quiz', {state: config});
    }}>
      <div className="settings">
        <div className="field">
          <label className="field-title" htmlFor="config-grade">Faixa pretendida</label>
          <GradeSelect id="config-grade" grade={grade} onChange={setChosen}/>
        </div>
        <fieldset className="field">
          <legend>Categorias</legend>
          <div className="chips">{categories.map(category => <button type="button" key={category} className="chip"
            aria-pressed={selected.includes(category)} onClick={() => toggle(category)}>
            {selected.includes(category) && <Icon name="check" size={15}/>}
            {categoryNames[category]}
          </button>)}</div>
          <p className="hint">Sem seleção, entram todas as categorias disponíveis.</p>
        </fieldset>
        <fieldset className="field">
          <legend>Quantidade</legend>
          <div className="chips">{([10, 20] as const).map(value => <label className="radio-chip" key={value}>
            <input type="radio" name="count" checked={count === value} onChange={() => setCount(value)}/>
            <span><Icon name="check" size={15}/>{value} questões</span>
          </label>)}</div>
        </fieldset>
        <fieldset className="field">
          <legend>Conteúdo da faixa</legend>
          <div className="chips">{[true, false].map(value => <label className="radio-chip" key={String(value)}>
            <input type="radio" name="scope" checked={cumulative === value} onChange={() => setCumulative(value)}/>
            <span><Icon name="check" size={15}/>{value ? 'Incluir faixas anteriores' : 'Apenas esta faixa'}</span>
          </label>)}</div>
        </fieldset>
      </div>
      <aside className={'availability' + (short ? ' warning' : '')} aria-label="Resumo da rodada">
        <div aria-live="polite" aria-atomic="true">
          <h2><Icon name={short ? 'alert' : 'book'}/>
            {!available ? 'Nenhuma questão disponível' : short ? available + ' de ' + count + ' questões disponíveis' : count + ' questões nesta rodada'}
          </h2>
          <p>{!available ? 'Selecione outra categoria ou inclua as faixas anteriores.' : short
            ? 'Com esses filtros, a rodada terá ' + plural(available, 'questão', 'questões') + '. Para incluir mais, altere os filtros.'
            : plural(available, 'questão disponível', 'questões disponíveis') + ' para esta seleção.'}</p>
        </div>
        <button className="button" disabled={!available} type="submit">
          {short && available ? 'Iniciar com ' + plural(available, 'questão', 'questões') : label}<Icon name="arrow" size={17}/>
        </button>
        {!training && <TextLink to={'/requisitos?faixa=' + grade.id}>Ver requisitos da faixa</TextLink>}
      </aside>
    </form>
  </section>;
}

function QuestionImage({question}: {question: Question}) {
  const [failed, setFailed] = useState(false);
  return <div className="question-image">
    {failed ? <div className="image-error" role="status"><Icon name="image" size={25}/>
      <strong>Imagem indisponível</strong><button className="button secondary" type="button" onClick={() => setFailed(false)}>Tentar novamente</button>
    </div> : <img src={studyAsset(question.imagePath!)} alt="Demonstração de saudação para identificar" onError={() => setFailed(true)}/>}
  </div>;
}

function Quiz() {
  const location = useLocation();
  const config = location.state as QuizConfig | undefined;
  const navigate = useNavigate();
  const [deck] = useState(() => config ? prepare(config) : []);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [maskEnabled, setMaskEnabled] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index > 0) {
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      heading.current?.focus({preventScroll: true});
    }
  }, [index]);
  useEffect(() => {
    if (selection !== null) feedback.current?.focus();
  }, [selection]);

  if (!config || !deck.length) return <Missing title="Nenhum quiz em andamento"/>;
  const grade = grades.find(item => item.id === config.gradeId)!;
  const current = deck[index];
  const item = media.find(entry => entry.id === current.mediaId);
  const video = item && studyMedia(item);
  const answered = selection !== null;
  const correct = selection === current.answer;
  const last = index === deck.length - 1;

  function next() {
    if (!config || selection === null) return;
    const updated = [...responses, {questionId: current.id, selected: selection, correct}];
    if (last) {
      const result = score(config, updated);
      saveResult(result);
      navigate('/resultado/' + encodeURIComponent(result.id), {state: result});
    } else {
      setResponses(updated);
      setSelection(null);
      setIndex(position => position + 1);
    }
  }

  return <section className={'wrap page quiz-page' + (current.kind === 'text' ? ' text-quiz' : '')}>
    <div className="quiz-progress">
      <div><GradeMark grade={grade}/><span className="data-label">Questão {index + 1} de {deck.length}</span></div>
      <div className="progress" aria-hidden="true">{deck.map((question, position) =>
        <span className={position <= index ? 'done' : ''} key={question.id}/>)}</div>
    </div>
    <div className="quiz-layout">
      <div className="question">
        <h1 ref={heading} tabIndex={-1}>{current.prompt}</h1>
        <p className="muted">{categoryNames[current.category]} · {current.kind === 'text' ? 'Teoria' : current.kind === 'image' ? 'Imagem' : 'Vídeo'}</p>
        {current.scope === 'supplemental' && <span className="badge complementary">Conteúdo complementar</span>}
        {current.imagePath && <QuestionImage key={current.id} question={current}/>}
        {video && <>
          <VideoPlayer key={current.id} media={video} maskEnabled={config.mode === 'simulado' || maskEnabled}/>
          {config.mode === 'treino' && item?.mask?.enabled && <label className="mask-option">
            <input type="checkbox" checked={maskEnabled} onChange={event => setMaskEnabled(event.target.checked)}/>
            Ocultar nome da técnica
          </label>}
          {video.source === 'youtube' && <p className="hint">Cobertura experimental quando configurada. Uso local.</p>}
        </>}
      </div>
      <div className="answer-panel">
        <p id="answer-heading">Escolha uma resposta</p>
        <div className="options" aria-labelledby="answer-heading" role="group">
          {current.options.map((option, position) => {
            const isCorrect = answered && option === current.answer;
            const isWrong = answered && !isCorrect && option === selection;
            const state = isCorrect ? 'correct' : isWrong ? 'wrong' : '';
            return <button type="button" key={option} disabled={answered} className={'option ' + state} onClick={() => setSelection(option)}>
              <span className="option-letter" aria-hidden="true">{'ABCD'[position]}</span>
              <span className="option-copy">{option}{state && <small>{isCorrect ? 'Correta' : 'Sua resposta'}</small>}</span>
              {state && <Icon name={isCorrect ? 'check' : 'close'}/>}
            </button>;
          })}
        </div>
        {answered && <div className={'feedback ' + (correct ? 'correct' : 'wrong')} tabIndex={-1} ref={feedback} aria-labelledby="feedback-title" role="region">
          <h2 id="feedback-title"><Icon name={correct ? 'check' : 'close'}/>{correct ? 'Resposta correta' : 'Resposta incorreta'}</h2>
          <p>{current.explanation}</p>
          <p className="hint">Fonte · {current.reference}</p>
          <button className="button" onClick={next}>{last ? 'Ver resultado' : 'Próxima questão'}<Icon name="arrow" size={17}/></button>
        </div>}
      </div>
    </div>
  </section>;
}

function Missing({title}: {title: string}) {
  return <section className="wrap page"><PageIntro title={title}/><ActionLink to="/faixas">Escolher faixa</ActionLink></section>;
}

function ResultPage() {
  const {id} = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as Result | undefined;
  const result = state?.id === id ? state : loadResults().find(item => item.id === id);
  if (!result) return <Missing title="Resultado não encontrado"/>;
  const grade = grades.find(item => item.id === result.config.gradeId);
  const training = result.config.mode === 'treino';
  const title = training ? 'Resultado do treino' : 'Resultado do simulado';
  const attempt = '/resultado/' + encodeURIComponent(result.id);
  const reviewPath = (filter: 'todas' | 'erros') => attempt + '?revisao=' + filter;
  const filter = params.get('revisao');
  const done = result.responses.length;
  if (filter === 'todas' || filter === 'erros') return <section className="wrap page review-page">
    <TextLink to={attempt} state={result} back>Voltar ao resultado</TextLink>
    <PageIntro title="Revise suas respostas">
      {grade && 'Faixa ' + grade.name + ' · '}{training ? 'Treino concluído' : 'Simulado concluído'}
    </PageIntro>
    <nav className="chips" aria-label="Filtro de respostas">
      <Link className="chip" aria-current={filter === 'todas' ? 'page' : undefined} to={reviewPath('todas')} state={result}>
        {filter === 'todas' && <Icon name="check" size={15}/>}Todas ({done})
      </Link>
      <Link className="chip" aria-current={filter === 'erros' ? 'page' : undefined} to={reviewPath('erros')} state={result}>
        {filter === 'erros' && <Icon name="check" size={15}/>}Erros ({result.wrong})
      </Link>
    </nav>
    {filter === 'erros' && result.wrong === 0 && <p className="empty-note">Você acertou todas as questões desta rodada.</p>}
    <div className="reviews">{result.responses.map((response, index) => {
      const question = questions.find(item => item.id === response.questionId);
      if (!question || (filter === 'erros' && response.correct)) return null;
      return <article className="review-card" key={response.questionId}>
        <div className="review-meta">
          <span className="data-label">Questão {index + 1} · {categoryNames[question.category]}</span>
          <span className={'badge ' + (response.correct ? 'correct' : 'wrong')}><Icon name={response.correct ? 'check' : 'close'} size={15}/>{response.correct ? 'Acertou' : 'Errou'}</span>
        </div>
        <h2>{question.prompt}</h2>
        {question.imagePath && <QuestionImage question={question}/>}
        <div className="review-answers">
          <p className={response.correct ? 'correct-ink' : 'wrong-ink'}>Sua resposta · {response.selected}</p>
          {!response.correct && <p className="correct-ink">Resposta correta · {question.answer}</p>}
        </div>
        <p>{question.explanation}</p>
        <p className="hint">{question.reference}</p>
      </article>;
    })}</div>
    <div className="actions"><ActionLink to="/treino">Abrir treino livre</ActionLink>
      <ActionLink className="secondary" to={'/requisitos?faixa=' + result.config.gradeId}>Ver requisitos da faixa</ActionLink></div>
  </section>;

  const breakdown = categoryBreakdown(result).sort((a, b) => (b.total - b.correct) - (a.total - a.correct));
  return <section className="wrap page result-page">
    <PageIntro title={title}>{grade && 'Faixa ' + grade.name + ' · '}{plural(done, 'questão respondida', 'questões respondidas')}</PageIntro>
    <div className="result-layout">
      <div className="score-card">
        <div className="score-line">
          <strong>{done ? Math.round(result.correct / done * 100) : 0}%</strong>
          <div><b>{plural(result.correct, 'acerto', 'acertos')} · {plural(result.wrong, 'erro', 'erros')}</b><span>Aproveitamento no quiz</span></div>
        </div>
        <ActionLink className="highlight" to={reviewPath(result.wrong ? 'erros' : 'todas')} state={result}>
          {result.wrong ? 'Revisar ' + plural(result.wrong, 'erro', 'erros') : 'Revisar respostas'}
        </ActionLink>
      </div>
      <div className="category-results">
        <h2>O que revisar</h2>
        <p className="muted">{result.wrong ? 'Comece pela categoria com mais erros.' : 'Você acertou todas as questões desta rodada.'}</p>
        <ul>{breakdown.map(row => {
          const errors = row.total - row.correct;
          return <li key={row.category}><div><strong>{categoryNames[row.category]}</strong><small>{row.correct} de {plural(row.total, 'acerto', 'acertos')}</small></div>
            <span className={'badge ' + (errors ? 'wrong' : 'correct')}>{errors ? plural(errors, 'erro', 'erros') : 'Sem erros'}</span>
          </li>;
        })}</ul>
      </div>
    </div>
    <p className="hint">A pontuação indica seu desempenho no quiz.</p>
    <div className="actions">
      {result.wrong > 0 && <ActionLink className="secondary" to={reviewPath('todas')} state={result}>Ver todas as respostas</ActionLink>}
      <ActionLink className="secondary" to={sessionPath(result.config)}>{training ? 'Fazer outro treino' : 'Fazer outro simulado'}</ActionLink>
    </div>
  </section>;
}

function SimulationConfig() {
  const {gradeId} = useParams();
  return <ConfigPage key={gradeId}/>;
}

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/faixas" element={<GradeSelection/>}/>
    <Route path="/requisitos" element={<Catalog/>}/>
    <Route path="/simulado/:gradeId" element={<SimulationConfig/>}/>
    <Route path="/treino" element={<ConfigPage training/>}/>
    <Route path="/quiz" element={<Quiz/>}/>
    <Route path="/resultado/:id" element={<ResultPage/>}/>
    <Route path="/resultados" element={<Navigate to="/faixas" replace/>}/>
    <Route path="*" element={<Home/>}/>
  </Routes></Layout>;
}

