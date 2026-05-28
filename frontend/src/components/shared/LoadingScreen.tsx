function LoadingScreen() {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--bk-bg)' }}
        >
            <div className="flex flex-col items-center gap-3">
                <span
                    className="text-[24px] font-bold"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-accent)' }}
                >
                    BookUp
                </span>
                <div
                    className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                />
            </div>
        </div>
    )
}

export default LoadingScreen;