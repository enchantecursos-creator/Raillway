require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});



app.use(cors());
app.use(express.json());

// --- ROTAS ---

// 1. Professor (exemplo: 1 professor fixo)
app.get('/professor', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professor LIMIT 1');
    if (result.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO professor (nome, email, tel, idiomas, valor_hora)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        ['Prof. Elise Silva', 'elise@escola.com', '(11) 99999-9999', 'Inglês, Francês, Espanhol', 25.00]
      );
      return res.json(insert.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar professor');
  }
});

// 2. Alunos
app.get('/alunos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});

app.post('/alunos', async (req, res) => {
  const { nome, turma, disciplina, status, professor_id, next_date, next_time, aulas_semana, duracao_min } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO alunos (nome, turma, disciplina, status, professor_id, next_date, next_time, aulas_semana, duracao_min)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nome, turma, disciplina, status, professor_id, next_date, next_time, aulas_semana, duracao_min]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir aluno');
  }
});

app.put('/alunos/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, turma, disciplina, status, professor_id, next_date, next_time, aulas_semana, duracao_min } = req.body;
  try {
    const result = await pool.query(
      `UPDATE alunos SET nome=$1, turma=$2, disciplina=$3, status=$4, professor_id=$5, next_date=$6, next_time=$7, aulas_semana=$8, duracao_min=$9 WHERE id=$10 RETURNING *`,
      [nome, turma, disciplina, status, professor_id, next_date, next_time, aulas_semana, duracao_min, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Aluno não encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar aluno');
  }
});

app.delete('/alunos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM alunos WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Aluno não encontrado');
    res.send('Aluno removido com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover aluno');
  }
});

// 3. Notas
app.get('/notas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notas ORDER BY data DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar notas');
  }
});

app.post('/notas', async (req, res) => {
  const { aluno_id, professor_id, data, disciplina, nota, observacoes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO notas (aluno_id, professor_id, data, disciplina, nota, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [aluno_id, professor_id, data, disciplina, nota, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir nota');
  }
});

app.put('/notas/:id', async (req, res) => {
  const id = req.params.id;
  const { aluno_id, professor_id, data, disciplina, nota, observacoes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE notas SET aluno_id=$1, professor_id=$2, data=$3, disciplina=$4, nota=$5, observacoes=$6 WHERE id=$7 RETURNING *`,
      [aluno_id, professor_id, data, disciplina, nota, observacoes, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Nota não encontrada');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar nota');
  }
});

app.delete('/notas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM notas WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Nota não encontrada');
    res.send('Nota removida com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover nota');
  }
});

// 4. Frequência
app.get('/frequencia', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM frequencia ORDER BY data DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar frequência');
  }
});

app.post('/frequencia', async (req, res) => {
  const { aluno_id, professor_id, data, presente } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO frequencia (aluno_id, professor_id, data, presente)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [aluno_id, professor_id, data, presente]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir frequência');
  }
});

app.put('/frequencia/:id', async (req, res) => {
  const id = req.params.id;
  const { aluno_id, professor_id, data, presente } = req.body;
  try {
    const result = await pool.query(
      `UPDATE frequencia SET aluno_id=$1, professor_id=$2, data=$3, presente=$4 WHERE id=$5 RETURNING *`,
      [aluno_id, professor_id, data, presente, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Registro de frequência não encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar frequência');
  }
});

app.delete('/frequencia/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM frequencia WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Registro de frequência não encontrado');
    res.send('Frequência removida com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover frequência');
  }
});

// 5. Agenda
app.get('/agenda', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agenda ORDER BY start');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agenda');
  }
});

app.post('/agenda', async (req, res) => {
  const { professor_id, titulo, start, end } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO agenda (professor_id, titulo, start, end)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [professor_id, titulo, start, end]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir evento na agenda');
  }
});

app.put('/agenda/:id', async (req, res) => {
  const id = req.params.id;
  const { professor_id, titulo, start, end } = req.body;
  try {
    const result = await pool.query(
      `UPDATE agenda SET professor_id=$1, titulo=$2, start=$3, end=$4 WHERE id=$5 RETURNING *`,
      [professor_id, titulo, start, end, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Evento não encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar evento');
  }
});

app.delete('/agenda/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM agenda WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Evento não encontrado');
    res.send('Evento removido com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover evento');
  }
});

// --- Fim das rotas ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});