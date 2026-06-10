import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class PersonalInfoComponent implements OnInit, OnDestroy {

  personalInfoForm!: FormGroup;

  isLocked = false;
  isExistingApplication = false;
  applicationStatus: 'DRAFT' | 'SUBMITTED' | 'PAID' = 'DRAFT';

  appNo: string | null = null;
  email: string | null = null;
  mobile: string | null = null;

  photoUploaded = false;
  signatureUploaded = false;

  photoUrl: string | null = null;
  signatureUrl: string | null = null;

  photoPreview: string = '';
  signaturePreview: string = '';

  photoError = '';
  signatureError = '';

  photoFileName: string = '';
  signatureFileName: string = '';

  photoUploadInvalid = false;
  signatureUploadInvalid = false;

  hideSubCaste = false;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('signInput') signInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toaster: ToastrService,
    private router: Router
  ) { }

  // =============================
  ngOnInit(): void {
    this.initForm();

    // ✅ ADD HERE
    setTimeout(() => {
      this.institutions.controls.forEach(control => {

        control.get('selected')?.valueChanges.subscribe(val => {

          const yearControl = control.get('trainingYear');

          if (val) {
            yearControl?.setValidators([
              Validators.required,
              Validators.pattern(/^(199\d|200\d|201\d|202[0-6])$/)
            ]);
          } else {
            yearControl?.clearValidators();
            yearControl?.setValue('');
          }

          yearControl?.updateValueAndValidity();

        });

      });
    });

    this.loadProfile();
    this.loadApplication();

  }

  ngOnDestroy(): void {
    if (this.photoPreview?.toString().startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview as string);
    }

    if (this.signaturePreview?.toString().startsWith('blob:')) {
      URL.revokeObjectURL(this.signaturePreview as string);
    }
  }

  // =============================
  // CREATE INSTITUTE LIST
  // =============================
  private createInstituteControls(): FormGroup[] {

    const list = [
      'STATE INSTITUTE FOR ADMINISTRATIVE CAREERS (SIAC), MUMBAI',
      'PRE IAS TRAINING CENTRE, NAGPUR',
      'PRE IAS TRAINING CENTRE, AMARAVATI',
      'PRE IAS TRAINING CENTRE, AURANGABAD',
      'PRE IAS TRAINING CENTRE, NASHIK',
      'PRE IAS TRAINING CENTRE, KOLHAPUR',
      'YASHWANTRAO CHAVAN ACADEMY OF DEVELOPMENT ADMINISTRATION(YASHADA), PUNE',
      'PIMPRI CHINCHWAD MUNICIPAL CORPORATION(PCMC), PUNE',
      'CHINTAMANRAO DESHMUKH INSTITUTE FOR ADMINISTRATIVE CAREERS, THANE',
      'UPSC/MPSC BHAVAN, AMBERNATH MUNICIPAL COUNCIL, AMBERNATH (UNDER THE AEGIS OF SIAC, MUMBAI)'
    ];

    return list.map(name =>
      this.fb.group({
        institutions: [name],
        selected: [false],
        trainingYear: ['']
      })
    );
  }

  // =============================
  // INIT FORM
  // =============================
  initForm(): void {

    this.personalInfoForm = this.fb.group({

      appNo: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }],

      fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      middleName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      motherName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],

      address1: ['', Validators.required],
      address2: ['', Validators.required],
      address3: [''],

      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      district: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      pin: ['', [Validators.required, Validators.pattern(/^(?!0{6}$)\d{6}$/)]],
      state: ['', Validators.required],
      aadhaar: ['', [Validators.required, Validators.pattern(/^(?!0{12}$)\d{12}$/)]],
      // [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      gender: ['', Validators.required],
      divyang: ['', Validators.required],
      orphan: ['', Validators.required],
      category: ['', [Validators.required, Validators.pattern(/^\d{2}-[A-Z()]+$/)]],
      subCaste: ['', [Validators.pattern(/^[A-Z0-9\- ]*$/)]],
      minority: ['', Validators.required],
      domicile: ['', Validators.required],

      dob: ['', Validators.required],
      age: [{ value: '', disabled: true }],

      optionalSubject: ['', Validators.required],
      examCenter: ['', Validators.required],
      borderDispute: ['', Validators.required],
      familyIncome: ['', Validators.required],

      // ✅ IMPORTANT
      isTrainedBefore: ['', Validators.required],
      // ✅ AGE CALCULATION SUBSCRIPTION
      institutions: this.fb.array(this.createInstituteControls()),

      qualification: ['', Validators.required],
      // passingYear: ['', Validators.required, Validators.pattern(/^[0-9]{4}$/)],
      passingYear: ['', [Validators.required, Validators.pattern(/^(199\d|200\d|201\d|202[0-6])$/)]],
      university: ['', Validators.required],

      photoUrl: ['', Validators.required],
      signatureUrl: ['', Validators.required],

      undertaking: [false, Validators.requiredTrue]
    });

    // Clear institutes if No selected
    this.personalInfoForm.get('isTrainedBefore')?.valueChanges.subscribe(val => {
      if (val === 'No') {
        this.institutions.controls.forEach(c => {
          c.get('selected')?.setValue(false);
          c.get('trainingYear')?.setValue('');
        });
      }
    });

    // ✅ AGE CALCULATION SUBSCRIPTION (Correct place)
    this.personalInfoForm.get('dob')?.valueChanges.subscribe(() => {
      this.calculateAge();
    });

    this.personalInfoForm.get('category')?.valueChanges.subscribe(value => {

      console.log('Category:', value);
      console.log('hideSubCaste:', this.hideSubCaste);
      const subCasteControl = this.personalInfoForm.get('subCaste');

      if (value?.includes('OPEN')) {
        this.hideSubCaste = true;

        subCasteControl?.setValue('');
        subCasteControl?.clearValidators();
      } else {
        this.hideSubCaste = false;

        subCasteControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[A-Z0-9\- ]+$/)
        ]);
      }

      subCasteControl?.updateValueAndValidity();

      this.cdr.markForCheck(); // 🔥 required for OnPush
    });



  }

  allowOnlyNumbers(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }



  // =============================
  // GETTER
  // =============================
  get institutions(): FormArray {
    return this.personalInfoForm.get('institutions') as FormArray;
  }

  // =============================
  // VALIDATION HELPER
  // =============================
  isInvalid(name: string, error: string): boolean {
    const control = this.personalInfoForm.get(name);
    return !!(control && control.touched && control.hasError(error));
  }

  // =============================
  // LOAD PROFILE
  // =============================
  loadProfile(): void {

    this.http.get<any>('http://localhost:4000/api/profile')
      .subscribe(res => {

        this.appNo = res.APP_NO;
        this.email = res.email;
        this.mobile = res.mobile;

        this.personalInfoForm.patchValue({
          appNo: this.appNo,
          email: this.email,
          mobile: this.mobile
        });

        this.cdr.markForCheck();
      });

  }

  // =============================
  // LOAD APPLICATION (EDIT MODE)
  // =============================
  loadApplication(): void {

    const token = localStorage.getItem('token');

    this.http.get<any>('http://localhost:4000/api/application', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .subscribe({
        next: (res) => {

          if (!res?.data) return;

          const d = res.data;

          this.isExistingApplication = true;

          console.log('Full application response:', res);
          console.log('Photo from data:', d.photoUrl);

          this.personalInfoForm.patchValue({

            fullName: d.full_name,
            firstName: d.first_name,
            middleName: d.middle_name,
            lastName: d.last_name,
            motherName: d.mother_name,

            address1: d.address1,
            address2: d.address2,
            address3: d.address3,

            city: d.city,
            district: d.district,
            pin: d.pin,
            state: d.state,
            aadhaar: d.aadhaar,

            gender: d.gender,
            divyang: d.divyang,
            orphan: d.orphan,
            category: d.category,
            subCaste: d.subCaste,   // ✅ FIXED
            minority: d.minority,
            domicile: d.domicile,

            dob: d.dob ? d.dob.substring(0, 10) : null,

            optionalSubject: d.optionalSubject,
            examCenter: d.examCenter,
            borderDispute: d.borderDispute,
            familyIncome: d.familyIncome,

            isTrainedBefore: d.isTrainedBefore,

            qualification: d.qualification,
            passingYear: d.passing_year,
            university: d.university,

            undertaking: d.undertaking === 1   // ✅ FIXED
          });


          // =============================
          // PATCH TRAINING INSTITUTES
          // =============================
          if (d.institutions?.length) {

            d.institutions.forEach((inst: any) => {

              const control = this.institutions.controls.find(
                c => c.get('institutions')?.value === inst.instituteName
              );

              if (control) {
                control.patchValue({
                  selected: true,
                  trainingYear: inst.trainingYear
                });
              }

            });

          }

          this.calculateAge();

          // =============================
          // ✅ FIXED PHOTO + SIGNATURE (FINAL)
          // =============================

          this.photoUrl = res.photoUrl || null;
          this.signatureUrl = res.signatureUrl || null;

          // ✅ Preview MUST use full URL
          this.photoPreview = this.photoUrl || '';
          this.signaturePreview = this.signatureUrl || '';

          this.photoUploaded = !!this.photoUrl;
          this.signatureUploaded = !!this.signatureUrl;

          this.photoUploadInvalid = false;
          this.signatureUploadInvalid = false;

          // ✅ Form must store full URL (not relative)
          this.personalInfoForm.patchValue({
            photoUrl: this.photoUrl,
            signatureUrl: this.signatureUrl
          });

          this.cdr.markForCheck();
        },
        error: () => {
          console.error('Failed to load application');
        }
      });
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.photoError = 'Photograph is required';
      this.photoUploaded = false;
      return;
    }

    const file = input.files[0];

    // ✅ Type check
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      this.photoUploadInvalid = true;
      this.photoError = 'Only JPG photo is allowed';
      this.toaster.error(this.photoError);
      input.value = '';
      return;
    }

    // 🔥 NEW: Resize instead of rejecting
    this.resizeImage(file, 200, 230, 10, 50).then((resizedFile: File) => {

      const sizeKB = resizedFile.size / 1024;

      // ✅ Size validation AFTER resize
      if (sizeKB < 10 || sizeKB > 50) {
        this.photoUploadInvalid = true;
        this.photoError = 'Photo size must be between 10 KB and 50 KB';
        this.toaster.error(this.photoError);
        input.value = '';
        return;
      }

      this.photoFileName = resizedFile.name;
      this.photoError = '';

      const formData = new FormData();
      formData.append('photo', resizedFile); // 🔥 use resized file

      this.http.post<any>('http://localhost:4000/api/upload', formData)
        .subscribe({
          next: (res) => {

            if (this.photoPreview?.toString().startsWith('blob:')) {
              URL.revokeObjectURL(this.photoPreview as string);
            }

            this.photoPreview = URL.createObjectURL(resizedFile);
            this.photoUrl = `http://localhost:4000${res.photoUrl}`;
            this.photoUploaded = true;
            this.photoUploadInvalid = false;

            this.personalInfoForm.patchValue({
              photoUrl: this.photoUrl
            });

            this.toaster.success('Photo uploaded successfully');
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.photoUploadInvalid = true;
            this.photoUploaded = false;
            this.photoError =
              err?.error?.message || 'Please upload valid photo';

            input.value = '';
            this.toaster.error(this.photoError);
            this.cdr.markForCheck();
          }
        });
    });
  }



  onSignUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.signatureError = 'Signature is required';
      this.signatureUploaded = false;
      return;
    }

    const file = input.files[0];

    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      this.signatureUploadInvalid = true;
      this.signatureError = 'Only JPG signature is allowed';
      this.toaster.error(this.signatureError);
      input.value = '';
      return;
    }

    // 🔥 Resize first
    this.resizeImage(file, 140, 60, 10, 30).then((resizedFile: File) => {

      const sizeKB = resizedFile.size / 1024;

      if (sizeKB < 2 || sizeKB > 30) {
        this.signatureUploadInvalid = true;
        this.signatureError = 'Signature size must be between 2 KB and 30 KB';
        this.toaster.error(this.signatureError);
        input.value = '';
        return;
      }

      this.signatureFileName = resizedFile.name;
      this.signatureError = '';

      const formData = new FormData();
      formData.append('signature', resizedFile);

      this.http.post<any>('http://localhost:4000/api/upload', formData)
        .subscribe({
          next: (res) => {

            if (this.signaturePreview?.toString().startsWith('blob:')) {
              URL.revokeObjectURL(this.signaturePreview as string);
            }

            this.signaturePreview = URL.createObjectURL(resizedFile);
            this.signatureUrl = `http://localhost:4000${res.signatureUrl}`;
            this.signatureUploaded = true;
            this.signatureUploadInvalid = false;

            this.personalInfoForm.patchValue({
              signatureUrl: this.signatureUrl
            });

            this.toaster.success('Signature uploaded successfully');
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.signatureUploadInvalid = true;
            this.signatureUploaded = false;
            this.signatureError =
              err?.error?.message || 'Please upload valid signature';

            input.value = '';
            this.toaster.error(this.signatureError);
            this.cdr.markForCheck();
          }
        });
    });
  }

  // =============================
  // AGE CALCULATION
  // =============================
  calculateAge(): void {

    const dobValue = this.personalInfoForm.get('dob')?.value;

    if (!dobValue) {
      this.personalInfoForm.patchValue(
        { age: '' },
        { emitEvent: false }
      );
      return;
    }

    const dob = new Date(dobValue);

    // Reference date: 01 August 2026
    const referenceDate = new Date('2026-08-01');

    let age = referenceDate.getFullYear() - dob.getFullYear();

    const monthDiff = referenceDate.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < dob.getDate())
    ) {
      age--;
    }

    // Prevent negative age
    if (age < 0) {
      age = 0;
    }

    if (age < 18 || age > 38) {
      this.personalInfoForm.get('dob')?.setErrors({ ageInvalid: true });
    }

    this.personalInfoForm.patchValue(
      { age: age },
      { emitEvent: false }
    );
  }

  toUpper(event: any, controlName: string) {
    const value = event.target.value.toUpperCase();
    this.personalInfoForm.get(controlName)?.setValue(value, { emitEvent: false });
  }

  resizeImage(
    file: File,
    width: number,
    height: number,
    minKB: number,
    maxKB: number
  ): Promise<File> {

    return new Promise((resolve) => {

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.9;

        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) return;

            const sizeKB = blob.size / 1024;

            console.log('Trying:', sizeKB.toFixed(2), 'KB');

            if (sizeKB >= minKB && sizeKB <= maxKB) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }
            else if (sizeKB > maxKB && quality > 0.1) {
              quality -= 0.1;
              tryCompress();
            }
            else if (sizeKB < minKB && quality < 1) {
              quality += 0.1;
              tryCompress();
            }
            else {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }

          }, 'image/jpeg', quality);
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  }


  // =============================
  // SUBMIT
  // =============================
  onSubmit(): void {

    this.photoError = '';
    this.signatureError = '';


    // Photo validation
    if (this.photoUploadInvalid) {

      this.toaster.error('Please upload valid photograph before saving');
      return;

    }

    // Signature validation
    if (this.signatureUploadInvalid) {

      this.toaster.error('Please upload valid signature before saving');
      return;

    }

    let isValid = true;

    if (!this.photoUrl) {
      this.photoError = 'Please upload valid photograph';
      isValid = false;
    }

    if (!this.signatureUrl) {
      this.signatureError = 'Please upload valid signature';
      isValid = false;
    }

    if (!isValid) return;

    // Form validation
    if (this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      isValid = false;
    }

    // Training institute validation
    if (this.personalInfoForm.value.isTrainedBefore === 'Yes') {

      const selected = this.institutions.controls.some(
        c => c.get('selected')?.value
      );

      if (!selected) {
        this.toaster.error('Please select at least one institute');
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    // Prepare payload
    let payload = this.personalInfoForm.getRawValue();

    payload.institutions = payload.institutions
      .filter((i: any) => i.selected)
      .map((i: any) => ({
        instituteName: i.institutions,
        trainingYear: i.trainingYear
      }));

    payload.undertaking = payload.undertaking ? 1 : 0;

    console.log("Payload before save:", payload);

    // ✅ Save application
    this.http.post('http://localhost:4000/api/application/save', payload)
      .subscribe({
        next: () => {

          // 🔹 Save training details AFTER application save
          this.http.post('http://localhost:4000/api/training-details', {
            appNo: this.appNo,
            trainingDetails: payload.institutions
          }).subscribe({

            next: () => {
              this.toaster.success('Application Saved');
              this.router.navigate(['/application-preview']);
            },

            error: () => {
              this.toaster.error('Training save failed');
            }

          });

        },

        error: () => {
          this.toaster.error('Application Save Failed');
        }
      });

  }

}