interface LoadingProps {
  message?: string;
}

const Loading = ({ message = "Loading beautiful things..." }: LoadingProps) => {
  return (
    <div className="text-center py-12 sm:py-16 md:py-20">
      <div className="spinner" />
      <p className="text-gray-500 text-sm sm:text-base">{message}</p>
    </div>
  );
};

export default Loading;
