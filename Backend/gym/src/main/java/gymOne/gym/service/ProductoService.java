package gymOne.gym.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.ProductoRequest;
import gymOne.gym.dto.ProductoResponse;
import gymOne.gym.entity.Producto;
import gymOne.gym.repository.ProductoRepository;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<ProductoResponse> listar() {
        return productoRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ProductoResponse crear(ProductoRequest request) {
        Producto producto = new Producto();
        aplicar(producto, request);
        return toResponse(productoRepository.save(producto));
    }

    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarOFallar(id);
        aplicar(producto, request);
        return toResponse(productoRepository.save(producto));
    }

    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    Producto buscarOFallar(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void aplicar(Producto producto, ProductoRequest request) {
        producto.setNombre(request.nombre());
        producto.setCategoria(Producto.Categoria.valueOf(request.categoria()));
        producto.setCosto(request.costo());
        producto.setPrecio(request.precio());
        producto.setStock(request.stock());
        producto.setProveedor(request.proveedor());
    }

    private ProductoResponse toResponse(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getCategoria().name(),
                producto.getCosto(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getProveedor());
    }
}
