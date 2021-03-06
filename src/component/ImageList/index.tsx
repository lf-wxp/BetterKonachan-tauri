import React, { CSSProperties, useCallback } from 'react';
import { FaDownload } from 'react-icons/fa';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useMeasure } from 'react-use';
import { useRecoilState, useRecoilValue } from 'recoil';

import Image from '../Image';
import useImageLoad from '../../hook/useImageLoad';
import useWaterfall from '../../hook/useWaterfall';
import fallbackImage from '../../image/loaderror.png';
import { securityState, imagesState, downloadItemsState } from '../../store';

import { TFunc2 } from '../../utils/type';
import { downloadItem } from '../../utils/action';
import { ImageDetail } from '../../model/image';
import { ImageDom } from '../../model/imageDom';
import { DownloadStatus } from '../../model/downloadItem';

import 'react-perfect-scrollbar/dist/css/styles.css';
import './style.pcss';

const maxWidth = 300;
const minWidth = 200;

export default React.memo(() => {
	const items = useRecoilValue<ImageDetail[]>(imagesState);
	const [security] = useRecoilState(securityState);
	const [, setDownloadItems] = useRecoilState(downloadItemsState);
	const [refDom, { width }] = useMeasure<HTMLDivElement>();
	const images = useImageLoad<ImageDetail>(items, 'preview');
	const list = useWaterfall({
		security,
		maxWidth,
		minWidth,
		width,
		images,
	});
	const downloadImage = useCallback(async (url: string, preview: string) => {
		setDownloadItems((prev) => {
			const hasItem = !!prev.find((item) => item.url === url && item.status !== DownloadStatus.FAIL);
			if (hasItem) return prev;
			downloadItem({ url, preview });
			return [...prev, { url, preview, percent: 0, status: DownloadStatus.PENDING }];
		});
	}, []);

	const combineStyle: TFunc2<CSSProperties, number, CSSProperties> =
		useCallback(
			(style: CSSProperties, key: number): CSSProperties => ({
				...style,
				transitionDelay: `${key * 0.05}s`,
			}),
			[]
		);

	return (
		<PerfectScrollbar>
			<div ref={refDom} className="bk-list__wrap">
				<TransitionGroup>
					{list.map((item: ImageDom, key: number) => (
						<CSSTransition key={item.id} timeout={5000} classNames="flip">
							<figure
								key={item.id}
								style={combineStyle(item.style as CSSProperties, key)}
								className="bk-list__item"
							>
								<Image
									fallback={fallbackImage}
									className="bk-list__img"
									width={item.styleW}
									height={item.styleH}
									style={{ animationDelay: `${key * 0.1}s` }}
									src={item.preview}
								/>
								<div className="bk-list__tool">
									<p className="bk-list__info">
										{item.width} <span>{item.width}</span> / {item.height}
										<span>{item.height}</span>
									</p>
								</div>
								<a
									onClick={() => downloadImage(item.url, item.preview)}
									className="bk-list__down"
									// rel="noopener noreferrer"
									data-id={item.id}
									download={item.name}
								>
									<FaDownload />
								</a>
							</figure>
						</CSSTransition>
					))}
				</TransitionGroup>
			</div>
		</PerfectScrollbar>
	);
});
