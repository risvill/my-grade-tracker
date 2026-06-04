import { useState } from 'react';

export const PredictorWidget = ({ subject }: { subject: any }) => {
  if (!subject) return <p>Выберите предмет для прогноза</p>;

  // Берем оценки из выбранного объекта предмета
  const currentTotal = ((Number(subject.rk1) + Number(subject.rk2)) / 2) * 0.6 + Number(subject.exam) * 0.4;

  return (
    <section className="card">
      <h3>Прогноз для: {subject.title}</h3>
      <p>Текущий балл: <strong>{currentTotal.toFixed(1)}%</strong></p>
      {/* Здесь будет логика расчета, сколько нужно добрать до цели */}
    </section>
  );
};