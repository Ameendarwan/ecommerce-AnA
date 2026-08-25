'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/ProductCard'
import { useProductsByCategory } from '@/hooks/queries'
import { ProductType } from '@/types'
import { ErrorState } from '@/components/ErrorState'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BrandLoader } from '@/components/BrandLoader'

interface CategoryPageProps {
	categoryName: string
	categoryId: number
	initialProducts?: ProductType[]
}

export default function CategoryPage({
	categoryName,
	categoryId,
	initialProducts,
}: CategoryPageProps) {
	const [searchTerm, setSearchTerm] = useState('')

	const {
		data: products,
		isLoading: loading,
		error,
		refetch: fetchProducts,
	} = useProductsByCategory(categoryId, { initialData: initialProducts })

	const filteredProducts = useMemo(() => {
		if (!products) return []

		if (searchTerm.trim() === '') {
			return products
		}

		return products.filter(
			(product) =>
				product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(product.description?.toLowerCase() || '').includes(
					searchTerm.toLowerCase()
				)
		)
	}, [searchTerm, products])

	return (
		<ErrorBoundary>
			<div className="space-y-4 py-4">
				<div>
					<h1 className="mb-4 text-3xl font-bold">{categoryName}</h1>
					<p className="text-muted-foreground mb-2">
						Pre-loved pieces — usually one of a kind
					</p>
				</div>

				<div className="mx-auto w-full max-w-md">
					<Input
						type="text"
						placeholder={`Search ${categoryName.toLowerCase()}...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full"
					/>
				</div>

				<div className="mt-6">
					{loading && !initialProducts?.length ? (
						<BrandLoader size="md" />
					) : error ? (
						<ErrorState
							title={`Failed to load ${categoryName.toLowerCase()}`}
							description={`We couldn't load the ${categoryName.toLowerCase()} products. Please try again.`}
							onRetry={fetchProducts}
							error={error}
							type="network"
						/>
					) : filteredProducts.length === 0 ? (
						<ErrorState
							title={`No ${categoryName.toLowerCase()} found`}
							description={
								searchTerm
									? 'Try a different search term'
									: `No ${categoryName.toLowerCase()} are available right now.`
							}
							showRetry={!searchTerm}
							onRetry={!searchTerm ? fetchProducts : undefined}
							type="not-found"
						/>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{filteredProducts.map((product, index) => (
								<ProductCard
									key={product.product_id}
									product={product}
									priority={index === 0}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</ErrorBoundary>
	)
}
