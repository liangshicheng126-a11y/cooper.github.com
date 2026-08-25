export default function NightBackdrop() {
  return (
    <div className="night-backdrop" aria-hidden>
      <div className="night-backdrop__image" />
      <div className="night-backdrop__beam night-backdrop__beam--wide" />
      <div className="night-backdrop__beam night-backdrop__beam--narrow" />
      <div className="night-backdrop__vignette" />
    </div>
  );
}
