import './GentleWhispers.css';

/**
 * GentleWhispers — Soft prompts for when memory feels blank or sparse.
 * Takes 10 seconds to answer; clicking fills the prompt into the memory box.
 * 
 * @param {Object} props
 * @param {Function} props.onSelectPrompt - Callback when a prompt is tapped
 */
export default function GentleWhispers({ onSelectPrompt }) {
  const whispers = [
    {
      label: 'A Catchphrase',
      prompt: 'They always used to say: "',
      hint: 'Something they said all the time',
    },
    {
      label: 'Small Joy',
      prompt: 'One small thing that never failed to make them smile was ',
      hint: 'A silly habit or tiny joy',
    },
    {
      label: 'Life Advice',
      prompt: 'The most important thing they taught me was ',
      hint: 'Words you still carry with you',
    },
    {
      label: 'Scent / Song',
      prompt: 'Whenever I encounter ',
      hint: 'A song, rain, or smell that brings them back',
    },
  ];

  return (
    <div className="gentle-whispers">
      <div className="gentle-whispers__header">
        <span className="gentle-whispers__icon">🕯️</span>
        <span className="gentle-whispers__title">Gentle Whispers</span>
        <span className="gentle-whispers__subtitle">If words feel scattered, start with something small</span>
      </div>

      <div className="gentle-whispers__chips">
        {whispers.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className="whisper-chip"
            onClick={() => onSelectPrompt(item.prompt)}
            title={item.hint}
          >
            <span className="whisper-chip__label">{item.label}</span>
            <span className="whisper-chip__preview">"{item.prompt}..."</span>
          </button>
        ))}
      </div>
    </div>
  );
}
