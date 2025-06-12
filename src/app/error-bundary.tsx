'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    errorType?: 'chunk' | 'render' | 'unknown'
    errorMessage?: string
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
        }
    }

    static getDerivedStateFromError(error: Error): State {
        const message = error.message || ''

        // 识别是否为 ChunkLoadError
        if (message.includes('ChunkLoadError') || /loading chunk \d+ failed/i.test(message)) {
            return {
                hasError: true,
                errorType: 'chunk',
                errorMessage: message,
            }
        }

        return {
            hasError: true,
            errorType: 'render',
            errorMessage: message,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)

        // Chunk load 的时候自动刷新一次（避免无限循环刷新）
        if (
            error?.message?.includes('ChunkLoadError') &&
            typeof window !== 'undefined' &&
            !window.location.href.includes('reloaded=true')
        ) {
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.set('reloaded', 'true')
            window.location.href = newUrl.toString()
        }
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // 显示错误页 UI
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 px-6">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">发生错误</h1>
                    <p className="text-lg text-gray-700 mb-3">
                        {this.state.errorType === 'chunk'
                            ? '部分页面资源加载失败，可能由于网络不稳定或系统更新。'
                            : '页面渲染过程中发生了错误。'}
                    </p>

                    {this.state.errorMessage && (
                        <pre className="bg-white border border-red-200 text-red-800 p-4 rounded shadow max-w-xl text-sm overflow-auto">
                            {this.state.errorMessage}
                        </pre>
                    )}

                    <button
                        onClick={this.handleReload}
                        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        重新加载页面
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
