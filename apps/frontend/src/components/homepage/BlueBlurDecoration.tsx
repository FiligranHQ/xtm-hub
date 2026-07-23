const BlueBlurDecoration = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={
          'absolute left-[15%] top-40 size-69.75 bg-filigran-decoration blur-[200px]'
        }
      />
      <div
        className={
          'absolute right-0 top-40 translate-x-1/2 size-110.75 bg-filigran-decoration blur-[200px]'
        }
      />
    </div>
  );
};

export default BlueBlurDecoration;
