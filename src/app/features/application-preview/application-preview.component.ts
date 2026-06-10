import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';




@Component({
  selector: 'app-application-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-preview.component.html',
  styleUrl: './application-preview.component.css',
})
export class ApplicationPreview implements OnInit {

  previewForm!: FormGroup;
  data: any;
  photoUrl: string | null = null;
  signatureUrl: string | null = null;
  isLocked = false;
  applicationStatus: 'DRAFT' | 'SUBMITTED' | 'PAID' = 'DRAFT';
  appNo: string = '';
  email: string = '';
  mobile: string = '';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private location: Location,
  ) {
    // IMPORTANT: DISABLE ROUTE REUSE HERE
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }



  //  DOWNLOAD FUNCTION
  async downloadApplication(): Promise<void> {

    const data = this.data;
    const container = document.createElement('div');
    const baseUrl = 'http://localhost:4200/';

    container.style.width = '800px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.padding = '15px';
    container.style.paddingBottom = '60px';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.3';

    let trainingHtml = '';

    if (data?.isTrainedBefore === 'Yes' && data?.institutions?.length) {
      trainingHtml = `
      <p><strong>Institutions for training before:</strong> Yes</p>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%;">
        <tr>
          <th>SrNo</th>
          <th>Institute Name</th>
          <th>Training Year</th>
        </tr>
        ${data.institutions.map((inst: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td>${inst.instituteName}</td>
            <td>${inst.trainingYear}</td>
          </tr>
        `).join('')}
      </table>
    `;
    } else {
      trainingHtml = `<p><strong>Institutions for training before:</strong> No</p>`;
    }

    // ✅ IMPORTANT: use FULL URL for images
    const photo = this.photoUrl || '';
    const sign = this.signatureUrl || '';

    container.innerHTML = `

<div class="page">

<header class="gov-header">

  <!-- TOP CENTER LOGO -->
  <div class="top-logo">
    <img src="${baseUrl}assets/images/satyamev-jayate-1.png" />
  </div>

  <!-- SECOND ROW -->
  <div class="header-row">

    <!-- LEFT LOGO -->
    <div class="logo-left">
      <img src="${baseUrl}assets/images/maharashtra-logo.png" />
    </div>

    <!-- CENTER TEXT -->
    <div class="header-text">
      <div class="gov-title">Government of Maharashtra</div>
      <div class="inst-title">STATE INSTITUTE FOR ADMINISTRATIVE CAREERS (SIAC)</div>
      <div class="exam-title">
        Application Form For Entrance Examination (SIAC-CET-2026-2027)
      </div>
    </div>

    <!-- EMPTY RIGHT (for balance) -->
    <div class="logo-right"></div>

  </div>

</header>

<div style="display:flex; justify-content:space-between;">
  <div>
    <p><strong>Registration No:</strong> ${this.appNo}</p>
    <p><strong>Email:</strong> ${this.email}</p>
    <p><strong>Mobile:</strong> ${this.mobile}</p>
    <p><strong>Status:</strong> ${this.applicationStatus}</p>
  </div>

  <img src="${photo}" style="width:120px;height:120px;border:1px solid #000"/>
</div>

<h3>Candidate Name (As mentioned in SSC Marksheet):</h3>
<table border="1">
<tr><td>Full Name</td><td>${data.full_name}</td></tr>
<tr><td>First Name</td><td>${data.first_name}</td></tr>
<tr><td>Middle Name</td><td>${data.middle_name}</td></tr>
<tr><td>Last Name</td><td>${data.last_name}</td></tr>
<tr><td>Mother Name</td><td>${data.mother_name}</td></tr>
</table>

<h3>Address for Communication:</h3>
<table border="1">
<tr><td>Address1</td><td>${data.address1}</td></tr>
<tr><td>Address2</td><td>${data.address2 || '-'}</td></tr>
<tr><td>Address3</td><td>${data.address3 || '-'}</td></tr>
<tr><td>City</td><td>${data.city}</td></tr>
<tr><td>District</td><td>${data.district}</td></tr>
<tr><td>State</td><td>${data.state}</td></tr>
<tr><td>PIN</td><td>${data.pin}</td></tr>
</table>

<h3>Personal Information:</h3>
<table border="1">
<tr><td>Aadhaar</td><td>${data.aadhaar}</td></tr>
<tr><td>Gender</td><td>${data.gender}</td></tr>
<tr><td>Divyang</td><td>${data.divyang}</td></tr>
<tr><td>Orphan</td><td>${data.orphan}</td></tr>
<tr><td>DOB</td><td>${data.dob}</td></tr>
<tr><td>Age</td><td>${data.age}</td></tr>
</table>

<h3>Category Details:</h3>
<table border="1">
<tr><td>Category</td><td>${data.category}</td></tr>
<tr><td>SubCaste</td><td>${data.subCaste || '-'}</td></tr>
<tr><td>Minority</td><td>${data.minority}</td></tr>
<tr><td>Domicile</td><td>${data.domicile}</td></tr>
</table>

<h3>Examination Details:</h3>
<table border="1">
<tr><td>Optional Subject</td><td>${data.optionalSubject}</td></tr>
<tr><td>Exam Center</td><td>${data.examCenter}</td></tr>
<tr><td>Border Dispute</td><td>${data.borderDispute}</td></tr>
<tr><td>Family Income</td><td>${data.familyIncome}</td></tr>
</table>

<h3>Have you previously taken advantage of any of these organizations for training?:</h3>
${trainingHtml}

<h3>Education Details:</h3>
<table border="1">
<tr><td>Qualification</td><td>${data.qualification}</td></tr>
<tr><td>Passing Year</td><td>${data.passing_year}</td></tr>
<tr><td>University</td><td>${data.university}</td></tr>
</table>

<h3>Declaration:-</h3>
<p>Undertaking: ${data.undertaking ? 'Yes' : 'No'}</p>

<div style="margin-top:40px;text-align:right;">
  <img src="${sign}" style="width:150px;height:50px;border:1px solid #000"/>
  <p>Candidate Signature</p>
</div>

</div>
`;


    // ✅ CREATE FULL HTML FOR PUPPETEER
    const html = `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 20px; }
          body { font-family: Arial; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #000; padding: 5px; }
          .page { page-break-after: always; }
                /* ================= HEADER CSS ================= */

      .gov-header {
        width: 100%;
        text-align: center;
        border-bottom: 2px solid black;
        margin-bottom: 15px;
        padding-bottom: 10px;
      }

      .top-logo img {
       width: 35px;
       height: auto;
       display: block;
       margin: 0 auto 5px;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo-left img {
        width: 65px;
      }

      .logo-right {
        width: 80px;
      }

      .header-text {
        flex: 1;
        text-align: center;
      }

      .gov-title {
        font-size: 18px;
      }

      .inst-title {
        font-size: 22px;
        font-weight: bold;
      }

      .exam-title {
        font-size: 18px;
        font-weight: 600;
      }

        </style>
      </head>
      <body>
        ${container.innerHTML}
      </body>
    </html>
  `;

    // ✅ CALL BACKEND (PUPPETEER)
    this.http.post('http://localhost:4000/api/generate-pdf',
      { html },
      { responseType: 'blob' }
    ).subscribe(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Application_${this.appNo}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }







  ngOnInit(): void {

    this.initForm();
    this.loadapplication(); //  always reload fresh data
  }

  loadapplication(): void {
    this.http.get<any>('http://localhost:4000/api/application')
      .subscribe({
        next: (res) => {

          if (!res?.data) {
            this.photoUrl = null;
            this.signatureUrl = null;
            return;
          }

          const d = res.data;
          this.data = d;
          this.appNo = d.APP_NO;
          // fallback if API does not send email/mobile
          this.email = d.email || localStorage.getItem('email') || '';
          this.mobile = d.mobile || localStorage.getItem('mobile') || '';

          // Patch form data
          this.previewForm.patchValue({
            fullName: d.full_name,
            firstName: d.first_name,
            middleName: d.middle_name,
            lastName: d.last_name,
            motherName: d.mother_name,
            divyang: d.divyang,
            orphan: d.orphan,
            address1: d.address1,
            address2: d.address2,
            address3: d.address3,
            city: d.city,
            district: d.district,
            pin: d.pin,
            state: d.state,
            aadhaar: d.aadhaar,
            gender: d.gender,
            category: d.category,
            subCaste: d.subCaste,
            minority: d.minority,
            domicile: d.domicile,
            borderDispute: d.borderDispute,
            qualification: d.qualification,
            university: d.university,
            passingYear: d.passing_year,
            examCenter: d.examCenter,
            familyIncome: d.familyIncome,
            optionalSubject: d.optionalSubject,
            isTrainedBefore: d.isTrainedBefore,
            institutions: d.institutions,
            undertaking: d.undertaking === 1,
            dob: d.dob
              ? new Date(d.dob).toISOString().substring(0, 10)
              : null,
            age: d.age
          });

          // ✅ FIXED MEDIA MAPPING
          this.photoUrl = res.photoUrl || null;
          this.signatureUrl = res.signatureUrl || null;

          console.log('Photo URL:', this.photoUrl);
          console.log('Signature URL:', this.signatureUrl);
          // Lock only if PAID
          // this.isLocked = res.is_locked === 1;
          // ✅ IMPORTANT
          this.applicationStatus = res.status;
          this.isLocked = this.applicationStatus === 'PAID';
          // Preview always readonly
          this.previewForm.disable();
        },
        error: (err) => {
          console.error('Preview load error', err);
          this.toastr.error('Failed to load application preview');
        }
      });

  }

  initForm(): void {
    this.previewForm = this.fb.group({
      fullName: [''],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      motherName: [''],
      divyang: [''],
      orphan: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      city: [''],
      district: [''],
      pin: [''],
      state: [''],
      aadhaar: [''],
      gender: [''],
      category: [''],
      subCaste: [''],
      minority: [''],
      domicile: [''],
      dob: [''],
      age: [''],
      borderDispute: [''],
      qualification: [''],
      university: [''],
      passingYear: [''],
      examCenter: [''],
      familyIncome: [''],
      optionalSubject: [''],
      // trainingInstitute: [''],

      institutions: [''],
      trainingYear: [''],
      undertaking: [''],
    });
  }

  //  FIXED ROUTE
  editApplication(): void {
    if (this.isLocked) {
      this.toastr.warning('Application is locked after payment');
      return;
    }

    this.router.navigate(['/personal-info']);
  }

  //  FIXED API
  finalSubmit(): void {

    //  If already PAID
    if (this.applicationStatus === 'PAID') {
      this.toastr.warning('Application form already submitted');
      return;
    }

    //  Validate Photo & Signature FIRST
    if (!this.photoUrl || !this.signatureUrl) {
      this.toastr.error('Photo and Signature are required before final submit');
      return;
    }

    this.http.post('http://localhost:4000/api/application/submit', {})
      .subscribe({
        next: () => {
          this.toastr.success('Application submitted successfully');
          this.applicationStatus = 'SUBMITTED';
          this.router.navigate(['/payment']);
        },
        error: (err) => {
          console.error('Final submit error', err);
          this.toastr.error('Failed to submit application');
        }
      });
  }
}