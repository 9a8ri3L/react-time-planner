export default function Footer() {
    return (
        <div className="footer">
            <p>
                Designed & implemented by
                <a href={'//x.com/_isCoding'} target="_blank" rel="noreferrer">
                    Gabriel
                </a>
                <a href={'//x.com/_isCoding'} target="_blank" rel="noreferrer">
                    <img
                        src={'/x-logo.png'}
                        alt="X Logo"
                        width={'20'}
                        height={'20'}
                    />
                </a>
            </p>
            <p>
                <a href={'//react.dev'} target="_blank" rel="noreferrer">
                    <span className="credits">Created by</span>
                    <img
                        src={'/react.svg'}
                        alt="React Logo"
                        width={'20px'}
                        height={28}
                    />
                </a>
                <span>{' | '}</span>
                <a href={'//netlify.com'} target="_blank" rel="noreferrer">
                    <span className="credits">Hosted by</span>
                    <img
                        src={'/netlify.svg'}
                        alt="Netlify Logo"
                        width={58}
                        height={30}
                    />
                </a>
            </p>
            <p>
                &copy;
                {new Date().getFullYear() !== 2025 && 2025 + ' - '}
                {new Date().getFullYear()}
                {' | '}
                <a href={'/'} rel="noreferrer">
                    Time Planner
                </a>
            </p>
        </div>
    );
}
