import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Tags } from 'lucide-react';
import type { Product, ProductCategory, ProductKind } from '@/types';
import { categoryApi, productApi } from '@/api';
import { mapCategory, mapProduct } from '@/api/mappers';
import { resolveImageUrl } from '@/lib/image';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type CategoryFormState = {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  productKind: ProductKind;
  isSellableDirectly: boolean;
  isCustomSelectable: boolean;
  imageFiles: File[];
  size: string;
  material: string;
  flowerType: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const initialCategoryForm: CategoryFormState = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

const initialProductForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  productKind: 'standard_product',
  isSellableDirectly: true,
  isCustomSelectable: false,
  imageFiles: [],
  size: '',
  material: '',
  flowerType: '',
  status: 'ACTIVE',
};

function productKindLabel(kind: ProductKind): string {
  return kind === 'standard_product' ? 'Sản phẩm thường' : 'Khung tranh';
}

export default function AdminProductList() {
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openCategoryManagerDialog, setOpenCategoryManagerDialog] = useState(false);
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
  const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);

  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productApi.getAdminProducts({
          page: 0,
          limit: 100,
          categoryId: categoryFilter === 'all' ? undefined : Number(categoryFilter),
          productKind: kindFilter === 'all' ? undefined : (kindFilter as ProductKind),
        }),
        categoryApi.getAdminCategories(),
      ]);

      const mappedCategories = categoriesResponse.data.map(mapCategory);
      const categoryMap = new Map(mappedCategories.map(c => [c.id, c]));
      const mappedProducts = productsResponse.data.map(mapProduct).map(product => ({
        ...product,
        category: categoryMap.get(product.categoryId),
      }));

      setCategories(mappedCategories);
      setProducts(mappedProducts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kindFilter, categoryFilter]);

  const filtered = useMemo(
    () => products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const handleProductKindChange = (value: ProductKind) => {
    if (value === 'frame_option') {
      setProductForm(prev => ({
        ...prev,
        productKind: value,
        isSellableDirectly: false,
        isCustomSelectable: true,
      }));
      return;
    }

    setProductForm(prev => ({
      ...prev,
      productKind: value,
      isSellableDirectly: true,
      isCustomSelectable: false,
    }));
  };

  const handleCreateCategory = async () => {
    setSubmittingCategory(true);
    try {
      await categoryApi.createCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        status: categoryForm.status,
      });
      toast.success('Tạo danh mục thành công');
      setCategoryForm(initialCategoryForm);
      setOpenCategoryDialog(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tạo danh mục thất bại';
      toast.error(message);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleOpenEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description ?? '',
      status: category.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    });
    setOpenEditCategoryDialog(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) {
      return;
    }
    setSubmittingCategory(true);
    try {
      await categoryApi.updateCategory(Number(editingCategory.id), {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        status: categoryForm.status,
      });
      toast.success('Cập nhật loại sản phẩm thành công');
      setOpenEditCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm(initialCategoryForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật loại sản phẩm thất bại';
      toast.error(message);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    try {
      await categoryApi.deleteCategory(Number(categoryId));
      toast.success('Xoá loại sản phẩm thành công');
      if (categoryFilter === categoryId) {
        setCategoryFilter('all');
      }
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xoá loại sản phẩm';
      toast.error(message);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.categoryId) {
      toast.error('Vui lòng chọn loại sản phẩm');
      return;
    }

    const selectedCategory = categories.find(category => category.id === productForm.categoryId);
    if (!selectedCategory || selectedCategory.status !== 'active') {
      toast.error('Không thể chọn loại sản phẩm đang ẩn');
      return;
    }

    if (productForm.imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh sản phẩm');
      return;
    }

    setSubmittingProduct(true);
    try {
      await productApi.createProduct({
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        categoryId: Number(productForm.categoryId),
        productKind: productForm.productKind,
        isSellableDirectly: productForm.isSellableDirectly,
        isCustomSelectable: productForm.isCustomSelectable,
        images: productForm.imageFiles,
        size: productForm.size || undefined,
        material: productForm.material || undefined,
        flowerType: productForm.flowerType || undefined,
        status: productForm.status,
      });
      toast.success('Tạo mặt hàng thành công');
      setProductForm(initialProductForm);
      setOpenCreateProductDialog(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tạo mặt hàng thất bại';
      toast.error(message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      categoryId: String(product.categoryId),
      productKind: product.productKind,
      isSellableDirectly: product.isSellableDirectly,
      isCustomSelectable: product.isCustomSelectable,
      imageFiles: [],
      size: product.size ?? '',
      material: product.material ?? '',
      flowerType: product.flowerType ?? '',
      status: product.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    });
    setOpenEditProductDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) {
      return;
    }

    if (!productForm.categoryId) {
      toast.error('Vui lòng chọn loại sản phẩm');
      return;
    }

    const selectedCategory = categories.find(category => category.id === productForm.categoryId);
    const isKeepingCurrentCategory = editingProduct.categoryId === productForm.categoryId;
    if (!selectedCategory || (selectedCategory.status !== 'active' && !isKeepingCurrentCategory)) {
      toast.error('Không thể chọn loại sản phẩm đang ẩn');
      return;
    }

    setSubmittingProduct(true);
    try {
      await productApi.updateProduct(Number(editingProduct.id), {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        categoryId: Number(productForm.categoryId),
        productKind: productForm.productKind,
        isSellableDirectly: productForm.isSellableDirectly,
        isCustomSelectable: productForm.isCustomSelectable,
        images: productForm.imageFiles.length > 0 ? productForm.imageFiles : undefined,
        size: productForm.size || undefined,
        material: productForm.material || undefined,
        flowerType: productForm.flowerType || undefined,
        status: productForm.status,
      });
      toast.success('Cập nhật mặt hàng thành công');
      setOpenEditProductDialog(false);
      setEditingProduct(null);
      setProductForm(initialProductForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật mặt hàng thất bại';
      toast.error(message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      await productApi.deleteProduct(Number(productId));
      toast.success('Đã xoá mặt hàng');
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Xoá mặt hàng thất bại';
      toast.error(message);
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý mặt hàng</h1>
        <div className="flex gap-2">
          <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Thêm loại sản phẩm</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm loại sản phẩm</DialogTitle></DialogHeader>
              <CategoryForm
                categoryForm={categoryForm}
                setCategoryForm={setCategoryForm}
                submitting={submittingCategory}
                submitLabel="Lưu loại sản phẩm"
                onSubmit={() => void handleCreateCategory()}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openCategoryManagerDialog} onOpenChange={setOpenCategoryManagerDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full"><Tags className="h-4 w-4" /> Quản lý loại sản phẩm</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Danh sách loại sản phẩm</DialogTitle></DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                          {category.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditCategory(category)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleDeleteCategory(category.id)}
                            disabled={deletingCategoryId === category.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>

          <Dialog open={openCreateProductDialog} onOpenChange={setOpenCreateProductDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Thêm mặt hàng</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Thêm mặt hàng</DialogTitle></DialogHeader>
              <ProductForm
                categories={categories}
                productForm={productForm}
                setProductForm={setProductForm}
                handleProductKindChange={handleProductKindChange}
                submitting={submittingProduct}
                submitLabel="Lưu mặt hàng"
                onSubmit={() => void handleCreateProduct()}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={openEditCategoryDialog} onOpenChange={setOpenEditCategoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa loại sản phẩm</DialogTitle></DialogHeader>
          <CategoryForm
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            submitting={submittingCategory}
            submitLabel="Cập nhật loại sản phẩm"
            onSubmit={() => void handleUpdateCategory()}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openEditProductDialog} onOpenChange={setOpenEditProductDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chỉnh sửa mặt hàng</DialogTitle></DialogHeader>
          <ProductForm
            categories={categories}
            productForm={productForm}
            setProductForm={setProductForm}
            handleProductKindChange={handleProductKindChange}
            submitting={submittingProduct}
            submitLabel="Cập nhật mặt hàng"
            onSubmit={() => void handleUpdateProduct()}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caption" />
              <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Lọc loại sản phẩm" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại sản phẩm</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại mặt hàng</SelectItem>
                <SelectItem value="standard_product">Sản phẩm thường</SelectItem>
                <SelectItem value="frame_option">Khung tranh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="mb-4 text-sm text-caption">Đang tải dữ liệu...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên mặt hàng</TableHead>
                <TableHead>Loại sản phẩm</TableHead>
                <TableHead>Loại mặt hàng</TableHead>
                <TableHead>Loại hoa</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Bán trực tiếp</TableHead>
                <TableHead>Custom</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                      <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-heading">{p.name}</span>
                      <p className="text-xs text-caption">{p.size || '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{p.category?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.productKind === 'frame_option' ? 'outline' : 'secondary'} className="text-xs">
                      {productKindLabel(p.productKind)}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.flowerType || '—'}</TableCell>
                  <TableCell className="font-medium">{p.price.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell>{p.isSellableDirectly ? '✓' : '—'}</TableCell>
                  <TableCell>{p.isCustomSelectable ? '✓' : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {p.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditProduct(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDeleteProduct(p.id)}
                        disabled={deletingProductId === p.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

type CategoryFormProps = {
  categoryForm: CategoryFormState;
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

function CategoryForm({
  categoryForm,
  setCategoryForm,
  submitting,
  submitLabel,
  onSubmit,
}: CategoryFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Tên loại sản phẩm</Label>
        <Input value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} />
      </div>
      <div>
        <Label>Mô tả</Label>
        <Input value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} />
      </div>
      <div>
        <Label>Trạng thái</Label>
        <Select value={categoryForm.status} onValueChange={v => setCategoryForm(prev => ({ ...prev, status: v as 'ACTIVE' | 'INACTIVE' }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" disabled={submitting} onClick={onSubmit}>{submitLabel}</Button>
    </div>
  );
}

type ProductFormProps = {
  categories: ProductCategory[];
  productForm: ProductFormState;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  handleProductKindChange: (value: ProductKind) => void;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

function ProductForm({
  categories,
  productForm,
  setProductForm,
  handleProductKindChange,
  submitting,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  return (
    <div className="space-y-3">
      <div><Label>Tên mặt hàng</Label><Input value={productForm.name} onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))} /></div>
      <div><Label>Mô tả</Label><Input value={productForm.description} onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))} /></div>
      <div><Label>Giá</Label><Input type="number" min="1" value={productForm.price} onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))} /></div>
      <div>
        <Label>Loại sản phẩm</Label>
        <Select value={productForm.categoryId} onValueChange={v => setProductForm(prev => ({ ...prev, categoryId: v }))}>
          <SelectTrigger><SelectValue placeholder="Chọn loại sản phẩm" /></SelectTrigger>
          <SelectContent>
            {categories
              .filter(category => category.status === 'active' || category.id === productForm.categoryId)
              .map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}{category.status !== 'active' ? ' (ẩn)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Loại mặt hàng</Label>
        <Select value={productForm.productKind} onValueChange={v => handleProductKindChange(v as ProductKind)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="standard_product">Sản phẩm thường</SelectItem>
            <SelectItem value="frame_option">Khung tranh</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Bán trực tiếp</Label>
          <Select
            value={String(productForm.isSellableDirectly)}
            onValueChange={v => setProductForm(prev => ({ ...prev, isSellableDirectly: v === 'true' }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Có</SelectItem>
              <SelectItem value="false">Không</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cho custom</Label>
          <Select
            value={String(productForm.isCustomSelectable)}
            onValueChange={v => setProductForm(prev => ({ ...prev, isCustomSelectable: v === 'true' }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Có</SelectItem>
              <SelectItem value="false">Không</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Ảnh sản phẩm (có thể chọn nhiều)</Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setProductForm(prev => ({ ...prev, imageFiles: Array.from(e.target.files ?? []) }))}
        />
        {productForm.imageFiles.length > 0 && (
          <p className="mt-1 text-xs text-caption">Đã chọn {productForm.imageFiles.length} ảnh</p>
        )}
      </div>
      <div><Label>Kích thước</Label><Input value={productForm.size} onChange={e => setProductForm(prev => ({ ...prev, size: e.target.value }))} /></div>
      <div><Label>Chất liệu</Label><Input value={productForm.material} onChange={e => setProductForm(prev => ({ ...prev, material: e.target.value }))} /></div>
      <div><Label>Loại hoa</Label><Input value={productForm.flowerType} onChange={e => setProductForm(prev => ({ ...prev, flowerType: e.target.value }))} /></div>
      <div>
        <Label>Trạng thái</Label>
        <Select value={productForm.status} onValueChange={v => setProductForm(prev => ({ ...prev, status: v as 'ACTIVE' | 'INACTIVE' }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" disabled={submitting} onClick={onSubmit}>{submitLabel}</Button>
    </div>
  );
}
