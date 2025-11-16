package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    public ResponseEntity<Staff> create(@Valid @RequestBody Staff staff) {
        Staff saved = staffService.create(staff);
        return ResponseEntity.created(URI.create("/api/staff/" + saved.getStaffID())).body(saved);
    }

    @GetMapping
    public List<Staff> all() { return staffService.findAll(); }

    @GetMapping("/{id}")
    public Staff byId(@PathVariable Long id) { return staffService.findById(id); }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        return staffService.update(id, staff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
